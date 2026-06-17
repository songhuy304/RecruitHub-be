import { plainToInstance } from 'class-transformer';

import { TeamEntity } from '@/common/entities/team.entity';
import { TeamResponseDto } from '../dtos/response';

export class TeamMapper {
  static toResponse(team: TeamEntity): TeamResponseDto[] {
    const response = plainToInstance(TeamResponseDto, team, {
      excludeExtraneousValues: true,
    });

    if (team.members) {
      response.users = team.members.map((member) => ({
        id: member.user?.id,
        userName: member.user?.userName,
        email: member.user?.email,
        fullName: member.user?.fullName,
        avatar: member.user?.avatar,
        role: member.user?.role,
        teamRole: member.role,
        isVerified: member.user?.isVerified,
      }));
    } else {
      response.users = [];
    }

    return [response];
  }

  static toResponseList(teams: TeamEntity[]): TeamResponseDto[] {
    return teams.map((team) => {
      const response = plainToInstance(TeamResponseDto, team, {
        excludeExtraneousValues: true,
      });

      if (team.members) {
        response.users = team.members.map((member) => ({
          id: member.user?.id,
          userName: member.user?.userName,
          email: member.user?.email,
          fullName: member.user?.fullName,
          avatar: member.user?.avatar,
          role: member.user?.role,
          teamRole: member.role,
          isVerified: member.user?.isVerified,
        }));
      } else {
        response.users = [];
      }

      return response;
    });
  }
}
