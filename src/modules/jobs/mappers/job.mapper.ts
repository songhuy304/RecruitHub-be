import { plainToInstance } from 'class-transformer';
import { JobEntity } from '@/common/entities/job.entity';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
export class JobMapper {
  static toResponse(job: JobEntity): JobResponseDto {
    return plainToInstance(
      JobResponseDto,
      {
        ...job,
        department: job.department?.name,
        team: job.team && {
          ...job.team,
          members:
            job.team.members?.map((member) => ({
              ...member.user,
              teamRole: member.role,
            })) ?? [],
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  static toResponses(jobs: JobEntity[]): JobResponseDto[] {
    return jobs.map(this.toResponse);
  }
}
