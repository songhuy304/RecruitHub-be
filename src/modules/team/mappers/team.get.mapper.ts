import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamResponseDto } from '../dtos/response';

export class TeamMapper {
  static toResponse(team: TeamEntity): TeamResponseDto[] {
    return [
      plainToInstance(TeamResponseDto, team, {
        excludeExtraneousValues: true,
      }),
    ];
  }
}
