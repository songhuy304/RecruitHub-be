import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobService } from '../services/job.service';
import { JobRequestDto } from '../dtos/requests';
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
}

