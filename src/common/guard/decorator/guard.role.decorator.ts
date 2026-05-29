import { SetMetadata } from '@nestjs/common';
import {
  ROLES_DECORATOR_KEY,
  TEAM_ROLES_DECORATOR_KEY,
} from '../constants/guard.constant';
import { ERole, ETeamRole } from '@/common/enums';

export const Roles = (...roles: ERole[]) =>
  SetMetadata(ROLES_DECORATOR_KEY, roles);

export const TeamRoles = (...roles: ETeamRole[]) =>
  SetMetadata(TEAM_ROLES_DECORATOR_KEY, roles);
