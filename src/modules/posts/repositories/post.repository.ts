import { PostEntity } from '@/common/database/entities';
import { PostTargetEntity } from '@/common/database/entities/post-target.entity';
import { BaseRepository } from '@/common/core';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class PostRepositoryImpl extends BaseRepository<PostEntity> {
  constructor(
    @InjectRepository(PostEntity)
    repo: TypeOrmRepository<PostEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async createWithTargets(
    postData: DeepPartial<PostEntity>,
    targets: DeepPartial<PostTargetEntity>[],
  ): Promise<PostEntity> {
    return this.repo.manager.transaction(async (manager) => {
      const post = await manager.save(
        PostEntity,
        manager.create(PostEntity, postData),
      );
      const savedTargets = await manager.save(
        PostTargetEntity,
        targets.map((target) =>
          manager.create(PostTargetEntity, { ...target, postId: post.id }),
        ),
      );
      post.targets = savedTargets;
      return post;
    });
  }

  async findByUserAndId(
    userId: number,
    id: number,
  ): Promise<PostEntity | null> {
    return this.repo.findOne({
      where: { userId, id },
      relations: { targets: { channelConnection: true } },
    });
  }
}
