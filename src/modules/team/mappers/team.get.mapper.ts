import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamInfoResponseDto } from '../dtos/response';

export class TeamMapper {
  static toResponse(team: TeamEntity): TeamInfoResponseDto {
    const response = plainToInstance(TeamInfoResponseDto, team, {
      excludeExtraneousValues: true,
    });

    return response;
  }

  static toResponseList(teams: TeamEntity[]): TeamInfoResponseDto[] {
    return teams.map((team) =>
      plainToInstance(TeamInfoResponseDto, team, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
