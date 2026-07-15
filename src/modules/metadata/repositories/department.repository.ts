import { BaseRepository } from '@/common/core';
import { DepartmentEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class DepartmentRepositoryImpl extends BaseRepository<DepartmentEntity> {
  constructor(
    @InjectRepository(DepartmentEntity)
    repo: TypeOrmRepository<DepartmentEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
