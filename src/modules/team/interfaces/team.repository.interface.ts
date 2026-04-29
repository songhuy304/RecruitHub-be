import { BaseRepository } from '@/common/core';
import { TeamEntity } from '@/common/entities/team.entity';

export abstract class ITeamRepository extends BaseRepository<TeamEntity> {}
