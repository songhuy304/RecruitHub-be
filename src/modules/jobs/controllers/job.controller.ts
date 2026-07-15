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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobService } from '../services/job.service';
import { CreateJobDto, JobRequestDto } from '../dtos/requests';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { JobResponseDto } from '../dtos/responses/job.response.dto';

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

  @Post()
  createJob(@Body() payload: CreateJobDto, @AuthUser() user: IAuthUser) {
    return this.jobService.createJob(payload, user);
  }

  @Put(':jobId')
  updateJob(
    @Body() payload: CreateJobDto,
    @AuthUser() user: IAuthUser,
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    return this.jobService.updateJob(jobId, payload, user);
  }
}
