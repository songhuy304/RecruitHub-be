import { plainToInstance } from 'class-transformer';
import { JobEntity } from '@/common/entities/job.entity';
import {
  JobResponseDto,
  JobTeamResponseDto,
  UserSummaryResponseDto,
} from '../dtos/responses/job.response.dto';
import { TeamEntity, TeamMemberEntity, UserEntity } from '@/common/entities';
import { ETeamRole } from '@/common/enums';

export class JobMapper {
  private static toTeamMember(
    user: UserEntity,
    teamRole?: ETeamRole,
  ): UserSummaryResponseDto {
    return plainToInstance(
      UserSummaryResponseDto,
      { ...user, teamRole },
      { excludeExtraneousValues: true },
    );
  }

  private static toTeam(team: TeamEntity): JobTeamResponseDto {
    const members =
      team.members?.map((member: TeamMemberEntity) =>
        this.toTeamMember(member.user, member.role),
      ) ?? [];

    return plainToInstance(
      JobTeamResponseDto,
      { ...team, members },
      { excludeExtraneousValues: true },
    );
  }

  static toResponse(job: JobEntity): JobResponseDto {
    return plainToInstance(
      JobResponseDto,
      {
        ...job,
        department: job.department, // giữ lại nếu department là getter/relation không được spread tự động
        team: job.team ? this.toTeam(job.team) : undefined,
        assignee: job.assignee ? this.toTeamMember(job.assignee) : undefined,
      },
      { excludeExtraneousValues: true },
    );
  }

  static toResponses(jobs: JobEntity[]): JobResponseDto[] {
    return jobs.map((job) => this.toResponse(job));
  }
}
