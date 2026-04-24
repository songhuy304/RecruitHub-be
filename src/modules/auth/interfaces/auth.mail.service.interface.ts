import { UserEntity } from '@/modules/users/entities/user.entity';

export interface IAuthMailService {
  forgotPasswordMail: (user: UserEntity, token: string) => Promise<void>;
}
