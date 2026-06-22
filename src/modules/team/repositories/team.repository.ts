import { TeamEntity } from '@/common/entities/team.entity';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { BaseRepository } from '@/common/core';
import { CreateTeamDto } from '../dtos/requests';
import { TEAM_FALLBACK } from '@/common/constants';
import { getRandomItem } from '@/common/utils';

@Injectable()
export class TeamRepositoryImpl extends BaseRepository<TeamEntity> {
  constructor(
    @InjectRepository(TeamEntity)
    repo: TypeOrmRepository<TeamEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async createTeam(payload: CreateTeamDto) {
    return this.create({
      ...payload,
      logoUrl: payload.logoUrl ?? getRandomItem(TEAM_FALLBACK),
    });
  }
}
