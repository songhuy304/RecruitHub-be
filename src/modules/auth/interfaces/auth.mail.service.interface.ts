import { UserEntity } from '@/common/entities/user.entity';

export interface IAuthMailService {
  forgotPasswordMail: (user: UserEntity, token: string) => Promise<void>;
}
