import { BaseRepository } from '@/common/core';
import { UserEntity } from '@/common/entities/user.entity';

export abstract class IUserRepository extends BaseRepository<UserEntity> {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findById(id: number): Promise<UserEntity | null>;
  abstract findByIdWithCurrentTeam(id: number): Promise<UserEntity | null>;
  abstract existsTeam(teamId: number): Promise<boolean>;
}
