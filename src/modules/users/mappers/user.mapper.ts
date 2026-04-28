import { UserEntity } from '@/common/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

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
