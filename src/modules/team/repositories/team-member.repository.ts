import { BaseRepository } from '@/common/core';
import { TeamMemberEntity } from '@/common/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class TeamMemberRepository extends BaseRepository<TeamMemberEntity> {
  constructor(
    @InjectRepository(TeamMemberEntity)
    repo: TypeOrmRepository<TeamMemberEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
