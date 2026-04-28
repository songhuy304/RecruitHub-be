import { Repository } from '@/common/core/repository';
import { UserEntity } from '@/common/entities/user.entity';
export abstract class IUserRepository extends Repository<UserEntity> {
  abstract findByEmailOrUsername(userName: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: number): Promise<UserEntity | null>;
}