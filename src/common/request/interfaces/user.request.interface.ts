import { ERole } from '@/common/enums';

export interface IAuthUser {
  userId: number;
  role: ERole;
}

export interface IRequest {
  user: IAuthUser;
}
