import { IsBoolean } from 'class-validator';
import { CreateJobDto } from './job.create.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateJobDto extends CreateJobDto {}
export class UpdateJobPinnedStatusDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  pinned: boolean;
}
