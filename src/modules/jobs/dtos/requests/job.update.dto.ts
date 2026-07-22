import { IsBoolean } from 'class-validator';
import { CreateJobDto } from './job.create.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateJobDto extends PartialType(CreateJobDto) {}
export class UpdateJobPinnedStatusDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  pinned: boolean;
}
