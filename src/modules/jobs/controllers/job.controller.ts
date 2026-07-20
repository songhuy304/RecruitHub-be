import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobService } from '../services/job.service';
import {
  CreateJobDto,
  JobGetSummaryRequestDto,
  JobRequestDto,
} from '../dtos/requests';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { JobResponseDto } from '../dtos/responses/job.response.dto';
import { JobSummaryResponseDto } from '../dtos/responses/job-summary.response.dto';
import { TeamRoles } from '@/common/guard/decorator/guard.role.decorator';
import { TeamRolesGuard } from '@/common/guard/team-role.guard';
import { ETeamRole } from '@/common/enums';

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
  @TeamRoles(ETeamRole.OWNER, ETeamRole.OWNER, ETeamRole.ADMIN)
  createJob(@Body() payload: CreateJobDto, @AuthUser() user: IAuthUser) {
    return this.jobService.createJob(payload, user);
  }

  @Put(':jobId')
  @UseGuards(TeamRolesGuard)
  @TeamRoles(ETeamRole.OWNER, ETeamRole.ADMIN)
  updateJob(
    @Body() payload: CreateJobDto,
    @AuthUser() user: IAuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    return this.jobService.updateJob(jobId, payload, user);
  }
}
