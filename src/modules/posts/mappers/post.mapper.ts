import { PostEntity } from '@/common/database/entities';
import { plainToInstance } from 'class-transformer';
import { PostResponseDto } from '../dtos/responses/post.response.dto';

export class PostMapper {
  static toResponse(post: PostEntity): PostResponseDto {
    return plainToInstance(
      PostResponseDto,
      {
        id: post.id,
        title: post.title,
        description: post.description,
        mediaUrl: post.mediaUrl,
        thumbnailUrl: post.thumbnailUrl,
        tags: post.tags,
        privacy: post.privacy,
        mediaType: post.mediaType,
        status: post.status,
        scheduledAt: post.scheduledAt,
        createdAt: post.createdAt,
        targets: (post.targets ?? []).map((target) => ({
          id: target.id,
          channelId: target.channelConnectionId,
          platform: target.platform,
          channelName: target.channelConnection?.displayName,
          username: target.channelConnection?.metadata?.username,
          status: target.status,
          externalPostId: target.externalPostId,
          externalUrl: target.externalUrl,
          errorMessage: target.errorMessage,
          publishedAt: target.publishedAt,
        })),
      },
      { excludeExtraneousValues: true },
    );
  }

  static toList(posts: PostEntity[]): PostResponseDto[] {
    return posts.map((post) => this.toResponse(post));
  }
}
