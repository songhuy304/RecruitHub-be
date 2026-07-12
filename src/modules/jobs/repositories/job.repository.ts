import { BaseRepository } from '@/common/core';
import { JobEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class jobRepositoryImpl extends BaseRepository<JobEntity> {
  constructor(
    @InjectRepository(JobEntity)
    repo: TypeOrmRepository<JobEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
