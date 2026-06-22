import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamDetailDto } from '../dtos/response';

export class TeamMapper {
  static toResponse(team: TeamEntity): TeamDetailDto {
    const response = plainToInstance(TeamDetailDto, team, {
      excludeExtraneousValues: true,
    });

    return response;
  }

  static toResponseList(teams: TeamEntity[]): TeamDetailDto[] {
    return teams.map((team) =>
      plainToInstance(TeamDetailDto, team, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
