import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamDetailDto } from '../dtos/response';
import { getTeamRoleByUser } from '../utils';

export class TeamMapper {
  static toResponse(team: TeamEntity, userId: number): TeamDetailDto {
    const teamRole = getTeamRoleByUser(team, userId);

    return plainToInstance(
      TeamDetailDto,
      {
        ...team,
        teamRole: teamRole,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toResponseList(teams: TeamEntity[], userId: number): TeamDetailDto[] {
    return teams.map((team) => TeamMapper.toResponse(team, userId));
  }
}
