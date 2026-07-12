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

    const { sortBy, sortOrder } = sort;

    const andFilters = [];

    if (status) {
      andFilters.push({ field: 'status', op: 'eq', value: status });
    }
    if (jobType) {
      andFilters.push({ field: 'employmentType', op: 'eq', value: jobType });
    }
    if (level) {
      andFilters.push({ field: 'level', op: 'eq', value: level });
    }
    if (isPinned !== undefined) {
      andFilters.push({ field: 'isPinned', op: 'eq', value: isPinned });
    }
    if (location) {
      andFilters.push({ field: 'location', op: 'ilike', value: location });
    }
    if (q) {
      andFilters.push({
        or: [
          { field: 'title', op: 'ilike', value: q },
          { field: 'description', op: 'ilike', value: q },
        ],
      });
    }
    if (createdAt) {
      if (createdAt.from || createdAt.to) {
        andFilters.push({
          field: 'createdAt',
          op: 'dateRange',
          value: [createdAt.from, createdAt.to],
        });
      }
    }

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
          [sortBy]: sortOrder || SortOrder.DESC,
        },
        filters: andFilters.length > 0 ? { and: andFilters } : undefined,
      },
    );

    const dataMap = JobMapper.toResponses(jobs.data);
    return PaginatedResponseDto.success(dataMap, jobs.meta);
  }
}
