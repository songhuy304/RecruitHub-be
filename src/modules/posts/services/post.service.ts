import { ERROR_POST } from '@/common/constants';
import { ChannelConnectionEntity } from '@/common/database/entities';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { SortOrder } from '@/common/helper/enums/query.enum';
import { ApiResponseDto, PaginatedResponseDto } from '@/common/response';
import { ChannelService } from '@/modules/channels/services/channel.service';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dtos/requests/create-post.dto';
import { ListPostDto } from '../dtos/requests/list-post.dto';
import { PostResponseDto } from '../dtos/responses/post.response.dto';
import { EPostMediaType } from '../enums/post-media-type.enum';
import { EPostPrivacy } from '../enums/post-privacy.enum';
import {
  EPostStatus,
  EPostTargetStatus,
} from '../enums/post-status.enum';
import { PostMapper } from '../mappers/post.mapper';
import { PostProducer } from '../producers/post.producer';
import { PostRepositoryImpl } from '../repositories/post.repository';
import { PostTargetRepositoryImpl } from '../repositories/post-target.repository';
import { PostPublisherService } from './post-publisher.service';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepositoryImpl,
    private readonly postTargetRepository: PostTargetRepositoryImpl,
    private readonly channelService: ChannelService,
    private readonly postProducer: PostProducer,
    private readonly postPublisherService: PostPublisherService,
  ) {}

  async create(
    userId: number,
    dto: CreatePostDto,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const connections = await this.channelService.getOwnedConnectedChannels(
      userId,
      dto.channelIds,
    );
    const delayMs = this.toDelayMs(dto.scheduledAt);
    const postStatus =
      delayMs > 0 ? EPostStatus.SCHEDULED : EPostStatus.PUBLISHING;

    const post = await this.postRepository.createWithTargets(
      {
        userId,
        title: dto.title,
        description: dto.description,
        mediaUrl: dto.mediaUrl,
        thumbnailUrl: dto.thumbnailUrl,
        tags: dto.tags,
        privacy: dto.privacy ?? EPostPrivacy.PRIVATE,
        mediaType: EPostMediaType.VIDEO,
        status: postStatus,
        scheduledAt: dto.scheduledAt,
      },
      connections.map((connection) => this.toTargetPayload(connection)),
    );

    await this.enqueuePendingTargets(post.targets ?? [], delayMs);
    await this.postPublisherService.syncPostStatus(post.id);

    const created = await this.postRepository.findByUserAndId(userId, post.id);
    return ApiResponseDto.success(PostMapper.toResponse(created ?? post));
  }

  async list(
    userId: number,
    query: ListPostDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const result = await this.postRepository.findMany(
      { page: query.page, limit: query.limit },
      {
        where: {
          userId,
          ...(query.status ? { status: query.status } : {}),
        },
        relations: { targets: { channelConnection: true } },
        sort: {
          createdAt: SortOrder.DESC,
          id: SortOrder.DESC,
        },
      },
    );

    return PaginatedResponseDto.success(
      PostMapper.toList(result.data),
      result.meta,
    );
  }

  async getById(
    userId: number,
    id: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const post = await this.getOwnedPost(userId, id);
    return ApiResponseDto.success(PostMapper.toResponse(post));
  }

  async retryFailed(
    userId: number,
    id: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const post = await this.getOwnedPost(userId, id);
    const failedTargets = (post.targets ?? []).filter((target) => {
      if (target.status !== EPostTargetStatus.FAILED) {
        return false;
      }
      return (
        !!target.channelConnectionId &&
        (this.postPublisherService.getPublisher(target.platform)?.supported ??
          false)
      );
    });

    if (!failedTargets.length) {
      throw new BadRequestException(ERROR_POST.NO_FAILED_TARGETS);
    }

    await this.postRepository.update(post.id, {
      status: EPostStatus.PUBLISHING,
    });

    for (const target of failedTargets) {
      await this.postTargetRepository.update(target.id, {
        status: EPostTargetStatus.PENDING,
        errorMessage: null,
      });
      await this.postProducer.enqueueTarget(target.id);
    }

    const updated = await this.getOwnedPost(userId, id);
    return ApiResponseDto.success(PostMapper.toResponse(updated));
  }

  private toTargetPayload(connection: ChannelConnectionEntity) {
    const publisher = this.postPublisherService.getPublisher(
      connection.platform,
    );
    const supported = publisher?.supported ?? false;

    return {
      channelConnectionId: connection.id,
      platform: connection.platform,
      status: supported
        ? EPostTargetStatus.PENDING
        : EPostTargetStatus.FAILED,
      errorMessage: supported ? undefined : ERROR_POST.PLATFORM_UNSUPPORTED,
    };
  }

  private async enqueuePendingTargets(
    targets: { id?: number; status: EPostTargetStatus }[],
    delayMs: number,
  ): Promise<void> {
    await Promise.all(
      targets
        .filter(
          (target) =>
            target.id && target.status === EPostTargetStatus.PENDING,
        )
        .map((target) =>
          this.postProducer.enqueueTarget(target.id as number, delayMs),
        ),
    );
  }

  private toDelayMs(scheduledAt?: Date): number {
    if (!scheduledAt) {
      return 0;
    }

    const delay = scheduledAt.getTime() - Date.now();
    if (delay <= 0) {
      throw new BadRequestException(ERROR_POST.SCHEDULE_INVALID);
    }
    return delay;
  }

  private async getOwnedPost(userId: number, id: number) {
    const post = await this.postRepository.findByUserAndId(userId, id);
    if (!post) {
      throw new NotFoundException(ERROR_POST.NOT_FOUND);
    }
    return post;
  }
}
