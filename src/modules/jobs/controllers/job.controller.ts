import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { ETeamRole } from '@/common/enums';
import { AuthUser } from '@/common/guard/decorator';
import { TeamRoles } from '@/common/guard/decorator/guard.role.decorator';
import { TeamRolesGuard } from '@/common/guard/team-role.guard';
import { IAuthUser } from '@/common/request/interfaces';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateJobDto,
  JobGetSummaryRequestDto,
  JobRequestDto,
  UpdateJobPinnedStatusDto,
} from '../dtos/requests';
import { JobSummaryResponseDto } from '../dtos/responses/job-summary.response.dto';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
import { JobService } from '../services/job.service';

@ApiTags('Jobs')
@ApiBearerAuth('accessToken')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Get all jobs',
    serialization: JobResponseDto,
    httpStatus: HttpStatus.OK,
    paginated: true,
    messageKey: '',
  })
  getJobs(@Query() query: JobRequestDto, @AuthUser() user: IAuthUser) {
    return this.jobService.getAllJobs(query, user);
  }

  @Get('/summary')
  @ApiEndpoint({
    summary: 'Get job summary',
    serialization: JobSummaryResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  getJobSummary(
    @Query() query: JobGetSummaryRequestDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.jobService.getJobSummary(query, user);
  }

  @Post()
  @UseGuards(TeamRolesGuard)
  @TeamRoles(ETeamRole.OWNER, ETeamRole.ADMIN)
  createJob(@Body() payload: CreateJobDto, @AuthUser() user: IAuthUser) {
    return this.jobService.createJob(payload, user);
  }

  @Patch(':jobId')
  @UseGuards(TeamRolesGuard)
  @TeamRoles(ETeamRole.OWNER, ETeamRole.ADMIN)
  updateJob(
    @Body() payload: CreateJobDto,
    @AuthUser() user: IAuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    return this.jobService.updateJob(jobId, payload, user);
  }

  @Patch(':jobId/pinned')
  pinnedJob(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Body() body: UpdateJobPinnedStatusDto,
  ) {
    return this.jobService.pinnedJob(jobId, body);
  }

  @Delete(':jobId')
  @UseGuards(TeamRolesGuard)
  @TeamRoles(ETeamRole.OWNER)
  deleteJob(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.jobService.deleteJob(jobId);
  }

  @Get(':jobId')
  @ApiEndpoint({
    summary: 'Get job by id',
    serialization: JobResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  getJobById(@Param('jobId', ParseIntPipe) jobId: number) {
    return this.jobService.getJobById(jobId);
  }
}
