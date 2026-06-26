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

    return dto;
  }

  static mapFromArray(members: TeamMemberEntity[]): TeamMemberGetDto[] {
    return members.map(this.mapFrom);
  }
}
