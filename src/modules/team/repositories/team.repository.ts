import { TeamEntity } from '@/common/entities/team.entity';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { ITeamRepository } from '../interfaces/team.repository.interface';

@Injectable()
export class TeamRepositoryImpl extends ITeamRepository {
  constructor(
    @InjectRepository(TeamEntity)
    repo: TypeOrmRepository<TeamEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
