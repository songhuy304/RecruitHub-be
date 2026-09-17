import { PostTargetEntity } from '@/common/database/entities';
import { BaseRepository } from '@/common/core';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class PostTargetRepositoryImpl extends BaseRepository<PostTargetEntity> {
  constructor(
    @InjectRepository(PostTargetEntity)
    repo: TypeOrmRepository<PostTargetEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async findByIdWithPost(id: number): Promise<PostTargetEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { post: true, channelConnection: true },
    });
  }

  async findByPostId(postId: number): Promise<PostTargetEntity[]> {
    return this.repo.find({
      where: { postId },
      relations: { channelConnection: true },
    });
  }
}
