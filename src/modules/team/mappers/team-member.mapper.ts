import { TeamMemberEntity } from '@/common/entities';
import { plainToInstance } from 'class-transformer';
import { TeamMemberGetDto } from '../dtos/response';
import { Mapper } from '@/common/core';

export class TeamMemberMapper extends Mapper<
  TeamMemberEntity,
  TeamMemberGetDto
> {
  static mapFrom(member: TeamMemberEntity): TeamMemberGetDto {
    const dto = plainToInstance(TeamMemberGetDto, member.user, {
      excludeExtraneousValues: true,
    });
    dto.teamRole = member.role;
    dto.createdAt = member.createdAt;
    dto.updatedAt = member.updatedAt;
    dto.created_at = member.createdAt;
    dto.updated_at = member.updatedAt;

    return dto;
  }

  static mapFromArray(members: TeamMemberEntity[]): TeamMemberGetDto[] {
    return members.map(this.mapFrom);
  }
}
