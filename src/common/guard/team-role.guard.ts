import { ETeamRole } from '@/common/enums';
import { TeamPermissionService } from '@/modules/team/services/team-permission.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_USER } from '../constants';
import { ForbiddenException } from '../filters/exception';
import { IRequest } from '../request/interfaces';
import { TEAM_ROLES_DECORATOR_KEY } from './constants/guard.constant';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly teamPermissionService: TeamPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ETeamRole[]>(
      TEAM_ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequest>();
    const { user } = request;

    if (!user?.userId) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const teamIdStr = request.user.teamId;
    if (!teamIdStr) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    if (isNaN(teamIdStr)) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    await this.teamPermissionService.requireRole(
      Number(teamIdStr),
      user.userId,
      requiredRoles,
    );

    return true;
  }
}
