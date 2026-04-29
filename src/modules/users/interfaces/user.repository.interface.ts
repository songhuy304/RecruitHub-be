import { BaseRepository } from '@/common/core';
import { UserEntity } from '@/common/entities/user.entity';

export abstract class IUserRepository extends BaseRepository<UserEntity> {
  abstract findByEmailOrUsername(userName: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: number): Promise<UserEntity | null>;
}
