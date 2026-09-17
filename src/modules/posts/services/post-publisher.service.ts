import { ERROR_POST } from '@/common/constants';
import { PostTargetEntity } from '@/common/database/entities';
import { BadRequestException } from '@/common/filters/exception';
import { ChannelService } from '@/modules/channels/services/channel.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHANNEL_PUBLISHERS,
  ChannelPublisherAdapter,
} from '../adapters/channel-publisher.adapter';
import {
  EPostStatus,
  EPostTargetStatus,
} from '../enums/post-status.enum';
import { ChannelPublishPayload } from '../interfaces/channel-publisher.interface';
import { PostRepositoryImpl } from '../repositories/post.repository';
import { PostTargetRepositoryImpl } from '../repositories/post-target.repository';
import { toPublisherError } from '../utils/publisher-error.util';

@Injectable()
export class PostPublisherService {
  private readonly logger = new Logger(PostPublisherService.name);

  constructor(
    private readonly postRepository: PostRepositoryImpl,
    private readonly postTargetRepository: PostTargetRepositoryImpl,
    private readonly channelService: ChannelService,
    @Inject(CHANNEL_PUBLISHERS)
    private readonly publishers: ChannelPublisherAdapter[],
  ) {}

  getPublisher(platform: string): ChannelPublisherAdapter | undefined {
    return this.publishers.find((item) => item.platform === platform);
  }

  async publishTarget(targetId: number): Promise<void> {
    const target = await this.postTargetRepository.findByIdWithPost(targetId);
    if (!target?.post) {
      this.logger.warn(`Post target ${targetId} not found`);
      return;
    }

    if (target.status === EPostTargetStatus.PUBLISHED) {
      return;
    }

    await this.postTargetRepository.update(target.id, {
      status: EPostTargetStatus.PUBLISHING,
      errorMessage: null,
    });
    await this.syncPostStatus(target.postId);

    try {
      const publisher = this.getPublisher(target.platform);
      if (!publisher?.supported) {
        throw new BadRequestException(ERROR_POST.PLATFORM_UNSUPPORTED);
      }
      if (!target.channelConnectionId) {
        throw new BadRequestException(ERROR_POST.PUBLISH_FAILED);
      }

      const accessToken = await this.channelService.getValidAccessToken(
        target.channelConnectionId,
      );
      const result = await publisher.publish(
        accessToken,
        this.toPayload(target),
      );

      await this.postTargetRepository.update(target.id, {
        status: EPostTargetStatus.PUBLISHED,
        externalPostId: result.externalPostId,
        externalUrl: result.externalUrl,
        errorMessage: null,
        publishedAt: new Date(),
      });
    } catch (error) {
      const message = toPublisherError(error);
      this.logger.error(`Publish target ${target.id} failed: ${message}`);
      await this.postTargetRepository.update(target.id, {
        status: EPostTargetStatus.FAILED,
        errorMessage: message,
      });
    }

    await this.syncPostStatus(target.postId);
  }

  async syncPostStatus(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { targets: true },
    });
    if (!post?.targets?.length) {
      return;
    }

    const statuses = post.targets.map((item) => item.status);
    const allPublished = statuses.every(
      (status) => status === EPostTargetStatus.PUBLISHED,
    );
    const allFailed = statuses.every(
      (status) => status === EPostTargetStatus.FAILED,
    );
    const hasPublished = statuses.some(
      (status) => status === EPostTargetStatus.PUBLISHED,
    );
    const inFlight = statuses.some(
      (status) =>
        status === EPostTargetStatus.PENDING ||
        status === EPostTargetStatus.PUBLISHING,
    );

    let nextStatus = post.status;
    if (allPublished) {
      nextStatus = EPostStatus.PUBLISHED;
    } else if (allFailed) {
      nextStatus = EPostStatus.FAILED;
    } else if (hasPublished && !inFlight) {
      nextStatus = EPostStatus.PARTIAL;
    } else if (inFlight && post.status !== EPostStatus.SCHEDULED) {
      nextStatus = EPostStatus.PUBLISHING;
    }

    if (nextStatus !== post.status) {
      await this.postRepository.update(postId, { status: nextStatus });
    }
  }

  private toPayload(target: PostTargetEntity): ChannelPublishPayload {
    return {
      title: target.post.title,
      description: target.post.description,
      mediaUrl: target.post.mediaUrl,
      tags: target.post.tags,
      privacy: target.post.privacy,
    };
  }
}
