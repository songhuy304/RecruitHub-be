import { ERROR_TEAM } from '@/common/constants';
import { ETeamRole } from '@/common/enums';
import { ForbiddenException } from '@/common/filters/exception';
import { Injectable } from '@nestjs/common';
import { TeamMemberRepository } from '../repositories/team-member.repository';
import { CacheService } from '@/common/cache/services/cache.service';
import { cacheKeyRole } from '../utils';

@Injectable()
export class TeamPermissionService {
  constructor(
    private readonly teamMemberRepo: TeamMemberRepository,
    private readonly cacheService: CacheService,
  ) {}

  async requireRole(
    teamId: number,
    userId: number,
    roles: ETeamRole[],
  ): Promise<void> {
    let teamRole = await this.cacheService.get<ETeamRole>(
      cacheKeyRole(teamId, userId),
    );

    if (!teamRole) {
      teamRole = await this.teamMemberRepo.getRoleByUser(userId, teamId);
      if (teamRole) {
        await this.cacheService.set(
          cacheKeyRole(teamId, userId),
          teamRole,
          60 * 30,
        );
      }
    }

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
