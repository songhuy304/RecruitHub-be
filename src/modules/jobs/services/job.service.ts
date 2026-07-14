import { IAuthUser } from '@/common/request/interfaces';
import { PaginatedResponseDto } from '@/common/response';
import { Injectable, Logger } from '@nestjs/common';
import { JobRequestDto } from '../dtos/requests/job.get.dto';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
import { JobMapper } from '../mappers/job.mapper';
import { jobRepositoryImpl } from '../repositories/job.repository';
import { SortOrder } from '@/common/enums';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(private readonly jobRepo: jobRepositoryImpl) {}

  async getAllJobs(
    query: JobRequestDto,
    user: IAuthUser,
  ): Promise<PaginatedResponseDto<JobResponseDto>> {
    const {
      limit,
      page,
      q,
      status,
      jobType,
      level,
      isPinned,
      createdAt,
      location,
      sort,
    } = query;

    const { sortBy, sortOrder } = sort || {};

    const jobs = await this.jobRepo.findMany(
      { limit, page },
      {
        where: {
          team: {
            id: user.teamId,
          },
        },
        relations: {
          team: true,
        },
        sort: {
          [sortBy || 'createdAt']: sortOrder || SortOrder.DESC,
        },
        filters: {
          and: [
            { field: 'status', op: 'eq', value: status },
            { field: 'employmentType', op: 'eq', value: jobType },
            { field: 'level', op: 'eq', value: level },
            { field: 'isPinned', op: 'eq', value: isPinned },
            { field: 'location', op: 'ilike', value: location },
            {
              or: [
                { field: 'title', op: 'ilike', value: q },
                { field: 'description', op: 'ilike', value: q },
              ],
            },
            {
              field: 'createdAt',
              op: 'dateRange',
              value: createdAt ? [createdAt.from, createdAt.to] : undefined,
            },
          ],
        },
      },
    );

    const dataMap = JobMapper.toResponses(jobs.data);
    return PaginatedResponseDto.success(dataMap, jobs.meta);
  }
}
