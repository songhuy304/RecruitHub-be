import {
  EmploymentType,
  JobLevel,
  JobStatus,
  WorkLocationType,
} from '@/common/entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Backend Developer',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ required: true })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiProperty({
    enum: EmploymentType,
  })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({
    enum: JobLevel,
  })
  @IsEnum(JobLevel)
  level: JobLevel;

  @ApiPropertyOptional({
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    example: 10000000,
  })
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional({
    example: 20000000,
  })
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional({
    default: 'VND',
    example: 'VND',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiPropertyOptional({
    example: '2026-07-15T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  openedAt?: Date;

  @ApiPropertyOptional({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  officeAddress?: string;

  @ApiProperty({
    example: 'Hà Nội',
  })
  @IsString()
  location: string;

  @ApiProperty({
    type: [String],
    example: ['Engineering', 'Platform'],
  })
  @IsArray()
  @IsString({ each: true })
  departments: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['NestJS', 'PostgreSQL', 'Docker'],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    enum: WorkLocationType,
  })
  @IsEnum(WorkLocationType)
  workLocationType: WorkLocationType;
}
