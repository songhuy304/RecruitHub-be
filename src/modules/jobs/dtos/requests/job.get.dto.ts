import { EmploymentType, JobLevel, JobStatus } from '@/common/entities';
import {
  DateRangeDto,
  PaginationRequestDto,
  SortRequestDto,
} from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum JobSortBy {
  CREATED_AT = 'createdAt',
  SALARY_MIN = 'salaryMin',
  SALARY_MAX = 'salaryMax',
  EXPIRES_AT = 'expiresAt',
  OPENED_AT = 'openedAt',
  TITLE = 'title',
}

export class JobRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    enum: EmploymentType,
    isArray: true,
  })
  @IsEnum(EmploymentType, { each: true })
  @IsOptional()
  jobType?: EmploymentType[];

  @ApiPropertyOptional({
    enum: JobLevel,
    isArray: true,
  })
  @IsEnum(JobLevel, { each: true })
  @IsOptional()
  level?: JobLevel[];

  @ApiPropertyOptional({ type: Boolean })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isPinned?: boolean;

  @ApiPropertyOptional({
    type: DateRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  createdAt?: DateRangeDto;

  @ApiPropertyOptional({
    type: SortRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SortRequestDto)
  sort?: SortRequestDto;

  @ApiPropertyOptional({
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  location?: string[];
}
