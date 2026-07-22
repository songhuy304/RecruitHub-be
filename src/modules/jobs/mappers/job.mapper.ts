import { plainToInstance } from 'class-transformer';
import { JobEntity } from '@/common/entities/job.entity';
import {
  JobResponseDto,
  UserSummaryResponseDto,
} from '../dtos/responses/job.response.dto';
import { UserEntity } from '@/common/entities';

export class JobMapper {
  private static toUserSummary(user: UserEntity): UserSummaryResponseDto {
    return plainToInstance(UserSummaryResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static toResponse(job: JobEntity): JobResponseDto {
    return plainToInstance(
      JobResponseDto,
      {
        ...job,
        department: job.department, // giữ lại nếu department là getter/relation không được spread tự động
        assignee: job.assignee ? this.toUserSummary(job.assignee) : undefined,
      },
      { excludeExtraneousValues: true },
    );
  }

  static toResponses(jobs: JobEntity[]): JobResponseDto[] {
    return jobs.map((job) => this.toResponse(job));
  }
}
