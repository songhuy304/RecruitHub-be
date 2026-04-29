import { UserEntity } from '@/common/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { TeamMemberDto } from '../dtos/response/team.get.response.dto';

export class MemberMapper {
  static toResponse(user: UserEntity): TeamMemberDto {
    return plainToInstance(TeamMemberDto, user, {
      excludeExtraneousValues: true,
    });
  }
  static toResponses(users: UserEntity[]): TeamMemberDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
