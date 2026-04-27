import { UserEntity } from '@/common/entities/user.entity';
import { UserResponseDto } from '../dtos/reponse';
import { plainToInstance } from 'class-transformer';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
  static toResponses(users: UserEntity[]): UserResponseDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
