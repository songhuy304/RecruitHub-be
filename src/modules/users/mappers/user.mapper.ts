import { UserEntity } from '@/common/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../dtos/responses/user.response.dto';

export class UserMapper {
  static toResponse(user: UserEntity): UserResponseDto {
    const currentTeamMember = user.teamMembers?.find(
      (member) => member.teamId === user.currentTeamId,
    );

    return plainToInstance(
      UserResponseDto,
      {
        ...user,
        currentTeam: currentTeamMember?.team
          ? {
              ...currentTeamMember.team,
              teamRole: currentTeamMember.role,
            }
          : undefined,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toResponses(users: UserEntity[]): UserResponseDto[] {
    return users.map(this.toResponse);
  }
}
