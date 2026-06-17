import { ETeamRole } from '@/common/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_USER } from '../constants';
import { ForbiddenException } from '../filters/exception';
import { IRequest } from '../request/interfaces';
import { TEAM_ROLES_DECORATOR_KEY } from './constants/guard.constant';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { DataSource } from 'typeorm';
import { TeamMemberEntity } from '../entities/team-member.entity';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userRepo: UserRepositoryImpl,
    private readonly dataSource: DataSource,
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

    const teamIdStr = request.params.teamId;
    if (!teamIdStr) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const teamId = parseInt(teamIdStr, 10);
    if (isNaN(teamId)) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    const member = await this.dataSource.getRepository(TeamMemberEntity).findOne({
      where: { userId: user.userId, teamId },
    });

    if (!member) {
      throw new ForbiddenException(ERROR_USER.FORBIDDEN);
    }

    return requiredRoles.some((role) => member.role === role);
  }
}
