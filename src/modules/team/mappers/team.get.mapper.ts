import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamDetailDto } from '../dtos/response';

export class TeamMapper {
  static toResponse(team: TeamEntity): TeamDetailDto {
    const { members, ...teamData } = team;

    return plainToInstance(
      TeamDetailDto,
      {
        ...teamData,
        members: members?.map((member) => ({
          ...member.user,
          teamRole: member.role,
        })),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toResponseList(teams: TeamEntity[]): TeamDetailDto[] {
    return teams.map((team) => TeamMapper.toResponse(team));
  }
}
