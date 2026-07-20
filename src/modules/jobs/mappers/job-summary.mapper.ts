import { JobStatus } from '@/common/entities';
import { JobSummaryResponseDto } from '../dtos/responses/job-summary.response.dto';

interface IJobBystatus {
  key: JobStatus;
  count: number;
}

export class JobSummaryMapper {
  static toJobSummary(
    total: number,
    input: IJobBystatus[],
  ): JobSummaryResponseDto {
    const statusMap = new Map<JobStatus, number>(
      input.map((item) => [item.key, item.count]),
    );

    const status: JobSummaryResponseDto = {
      total,
      open: statusMap.get(JobStatus.OPEN) || 0,
      closed: statusMap.get(JobStatus.CLOSED) || 0,
      draft: statusMap.get(JobStatus.DRAFT) || 0,
      achieved: statusMap.get(JobStatus.ARCHIVED) || 0,
    };
    return status;
  }
}
