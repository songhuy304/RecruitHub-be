import { ERole, ETeamRole } from '@/common/enums';

export interface IAuthUser {
  userId: number;
  role: ERole;
  teamRole: ETeamRole | null;
  teamId: number | null;
}

export interface IRequest {
  user: IAuthUser;
}
