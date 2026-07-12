import { BaseRepository } from '@/common/core';
import { LocationEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class LocationRepositoryImpl extends BaseRepository<LocationEntity> {
  constructor(
    @InjectRepository(LocationEntity)
    repo: TypeOrmRepository<LocationEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
