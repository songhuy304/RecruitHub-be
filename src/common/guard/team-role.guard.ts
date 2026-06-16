import { ETeamRole } from '@/common/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_USER } from '../constants';
import { ForbiddenException } from '../filters/exception';
import { IRequest } from '../request/interfaces';
import { TEAM_ROLES_DECORATOR_KEY } from './constants/guard.constant';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userRepo: UserRepositoryImpl,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ETeamRole[]>(
      TEAM_ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<IRequest>();

    if (!user?.userId) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const dbUser = await this.userRepo.findOne({
      where: { id: user.userId },
      select: {
        teamRole: true,
      },
    });

    if (!dbUser?.teamRole) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    return requiredRoles.some((role) => dbUser.teamRole === role);
  }
}
