import { ERROR_JOB } from '@/common/constants';
import { JobEntity } from '@/common/entities';
import { SortOrder } from '@/common/enums';
import { NotFoundException } from '@/common/filters/exception';
import { QueryOptions } from '@/common/helper/interfaces/helper-query.interface';
import { IAuthUser } from '@/common/request/interfaces';
import {
  ApiGenericResponseDto,
  ApiResponseDto,
  PaginatedResponseDto,
} from '@/common/response';
import { DepartmentRepositoryImpl } from '@/modules/metadata/repositories/department.repository';
import { Injectable, Logger } from '@nestjs/common';
import { CreateJobDto } from '../dtos/requests';
import {
  JobGetSummaryRequestDto,
  JobRequestDto,
} from '../dtos/requests/job.get.dto';
import { JobSummaryResponseDto } from '../dtos/responses/job-summary.response.dto';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
import { JobSummaryMapper } from '../mappers';
import { JobMapper } from '../mappers/job.mapper';
import { jobRepositoryImpl } from '../repositories/job.repository';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly jobRepo: jobRepositoryImpl,
    private readonly departmentRepo: DepartmentRepositoryImpl,
  ) {}

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
          department: true,
        },
        sort: {
          isPinned: SortOrder.DESC,
          [sortBy || 'createdAt']: sortOrder || SortOrder.DESC,
        },
        filters: {
          and: [
            { field: 'status', op: 'eq', value: status },
            { field: 'employmentType', op: 'in', value: jobType },
            { field: 'level', op: 'in', value: level },
            { field: 'isPinned', op: 'eq', value: isPinned },
            { field: 'location', op: 'in', value: location },
            { field: 'title', op: 'ilike', value: q },
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

  async getJobSummary(
    query: JobGetSummaryRequestDto,
    user: IAuthUser,
  ): Promise<ApiResponseDto<JobSummaryResponseDto>> {
    const { q, jobType, level, createdAt, location } = query;

    const queryOptions: Pick<QueryOptions<JobEntity>, 'where' | 'filters'> = {
      where: {
        team: {
          id: user.teamId,
        },
      },
      filters: {
        and: [
          { field: 'employmentType', op: 'in', value: jobType },
          { field: 'level', op: 'in', value: level },
          { field: 'location', op: 'in', value: location },
          { field: 'title', op: 'ilike', value: q },
          {
            field: 'createdAt',
            op: 'dateRange',
            value: createdAt ? [createdAt.from, createdAt.to] : undefined,
          },
        ],
      },
    };

    const [totalJobs, jobsByStatus] = await Promise.all([
      this.jobRepo.count(queryOptions),
      this.jobRepo.groupCount('status', queryOptions),
    ]);

    const newValue = JobSummaryMapper.toJobSummary(totalJobs, jobsByStatus);

    return ApiResponseDto.success(newValue);

    // const totalJobs = await this.jobRepo.repository
    //   .createQueryBuilder('job')
    //   .select('COUNT(job.id)', 'count')
    //   .where('job.teamId = :teamId', { teamId: user.teamId })
    //   .getRawOne();

    // const result = await this.jobRepo.repository
    //   .createQueryBuilder('job')
    //   .select('job.status', 'status')
    //   .addSelect('COUNT(job.id)', 'count')
    //   .groupBy('job.status')
    //   .getRawMany();
  }

  async createJob(
    payload: CreateJobDto,
    user: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const department = await this.departmentRepo.findById(payload.department);
      if (!department) {
        throw new NotFoundException('Department not found');
      }

      await this.jobRepo.create({
        ...payload,
        department: department,
        team: {
          id: user.teamId,
        },
      });
    } catch (error) {
      this.logger.error('Error creating job', error);
      throw new Error('Failed to create job');
    }

    return ApiGenericResponseDto.success('Job created successfully');
  }

  async updateJob(
    jobId: number,
    payload: CreateJobDto,
    user: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const job = await this.jobRepo.findOne({
        where: {
          id: jobId,
          team: {
            id: user.teamId,
          },
        },
      });

      if (!job || job.team.id !== user.teamId) {
        throw new NotFoundException(ERROR_JOB.NOT_FOUND);
      }

      const department = await this.departmentRepo.findById(payload.department);
      if (!department) {
        throw new NotFoundException('Department not found');
      }

      await this.jobRepo.update(jobId, {
        ...payload,
        department: department,
      });
    } catch (error) {
      this.logger.error('Error updating job', error);
      throw new Error('Failed to update job');
    }

    return ApiGenericResponseDto.success('Job updated successfully');
  }
}
