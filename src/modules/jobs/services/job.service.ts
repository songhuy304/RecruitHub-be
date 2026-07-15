import { ERROR_JOB } from '@/common/constants';
import { SortOrder } from '@/common/enums';
import { NotFoundException } from '@/common/filters/exception';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, PaginatedResponseDto } from '@/common/response';
import { Injectable, Logger } from '@nestjs/common';
import { CreateJobDto } from '../dtos/requests';
import { JobRequestDto } from '../dtos/requests/job.get.dto';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
import { JobMapper } from '../mappers/job.mapper';
import { jobRepositoryImpl } from '../repositories/job.repository';
import { TeamPermissionService } from '@/modules/team/services/team-permission.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    private readonly jobRepo: jobRepositoryImpl,
    private readonly teamPermissionService: TeamPermissionService,
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

  async createJob(
    payload: CreateJobDto,
    user: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      await this.teamPermissionService.requireOwnerOrAdmin(
        user.teamId,
        user.userId,
      );

      await this.jobRepo.create({
        ...payload,
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
      await this.teamPermissionService.requireOwnerOrAdmin(
        user.teamId,
        user.userId,
      );

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

      await this.jobRepo.update(jobId, payload);
    } catch (error) {
      this.logger.error('Error updating job', error);
      throw new Error('Failed to update job');
    }

    return ApiGenericResponseDto.success('Job updated successfully');
  }
}
