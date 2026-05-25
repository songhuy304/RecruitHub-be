import { BaseRepository } from '@/common/core';
import { TeamRequestEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class TeamRequestRepository extends BaseRepository<TeamRequestEntity> {
  constructor(
    @InjectRepository(TeamRequestEntity)
    repo: TypeOrmRepository<TeamRequestEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
