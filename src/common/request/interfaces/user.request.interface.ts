import { ERole } from '@/common/enums';

export interface IAuthUser {
  userId: number;
  role: ERole;
  teamId: number | null;
}

export interface IRequest {
  user: IAuthUser;
}
