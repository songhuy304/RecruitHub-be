import { UserEntity } from '@/common/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponseDto {
    const response = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    if (user.teamMembers && user.teamMembers.length > 0) {
      response.teamId = user.teamMembers[0].teamId;
      response.teamRole = user.teamMembers[0].role;
      response.teams = user.teamMembers.map((member) => ({
        teamId: member.teamId,
        role: member.role,
      }));
    } else {
      response.teamId = null;
      response.teamRole = null;
      response.teams = [];
    }

    return response;
  }

  static toResponses(users: UserEntity[]): UserResponseDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
