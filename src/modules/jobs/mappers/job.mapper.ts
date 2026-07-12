import { plainToInstance } from 'class-transformer';
import { JobEntity } from '@/common/entities/job.entity';
import { JobResponseDto } from '../dtos/responses/job.response.dto';

export class JobMapper {
  static toResponse(job: JobEntity): JobResponseDto {
    return plainToInstance(JobResponseDto, job, {
      excludeExtraneousValues: true,
    });
  }

  static toResponses(jobs: JobEntity[]): JobResponseDto[] {
    return jobs.map((job) => this.toResponse(job));
  }
}
