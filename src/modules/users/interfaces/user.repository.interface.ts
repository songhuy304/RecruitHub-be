import { Repository } from '@/common/core/repository';
import { UserEntity } from '@/common/entities/user.entity';

export interface IUserRepository extends Repository<UserEntity> {
  findByEmailOrUsername(userName: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
}
