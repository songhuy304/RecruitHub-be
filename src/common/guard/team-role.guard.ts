import { ETeamRole } from '@/common/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_USER } from '../constants';
import { ForbiddenException } from '../filters/exception';
import { IRequest } from '../request/interfaces';
import { TEAM_ROLES_DECORATOR_KEY } from './constants/guard.constant';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ETeamRole[]>(
      TEAM_ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<IRequest>();

    if (!user || !user.teamRole) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const hasRole = requiredRoles.some(
      (role) =>
        user.teamRole === role ||
        (Array.isArray(user.teamRole) && user.teamRole.includes(role)),
    );

    return hasRole;
  }
}
