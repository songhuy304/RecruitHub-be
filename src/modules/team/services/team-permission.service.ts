import { ERROR_TEAM } from '@/common/constants';
import { ETeamRole } from '@/common/enums';
import { ForbiddenException } from '@/common/filters/exception';
import { Injectable } from '@nestjs/common';
import { TeamMemberRepository } from '../repositories/team-member.repository';

@Injectable()
export class TeamPermissionService {
  constructor(private readonly teamMemberRepo: TeamMemberRepository) {}

  async requireRole(
    teamId: number,
    userId: number,
    roles: ETeamRole[],
  ): Promise<void> {
    const teamRole = await this.teamMemberRepo.getRoleByUser(userId, teamId);

    if (!teamRole || !roles.includes(teamRole)) {
      throw new ForbiddenException(ERROR_TEAM.PERMISSION_DENIED);
    }
  }

  async requireOwner(teamId: number, userId: number): Promise<void> {
    return this.requireRole(teamId, userId, [ETeamRole.OWNER]);
  }

  async requireOwnerOrAdmin(teamId: number, userId: number): Promise<void> {
    return this.requireRole(teamId, userId, [ETeamRole.OWNER, ETeamRole.ADMIN]);
  }
}
