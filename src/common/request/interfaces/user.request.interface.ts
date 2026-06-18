import { ERole } from '@/common/enums';

export interface IAuthUser {
  userId: number;
  role: ERole;
  teamId: number;
}

export interface IRequest {
  user: IAuthUser;
  params: Record<string, string>;
}
