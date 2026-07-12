import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { EmploymentType, JobLevel, JobStatus } from '@/common/entities';

export class JobTeamResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Tech Company' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ example: 'tech-company' })
  @Expose()
  @IsString()
  slug: string;

  @ApiProperty({ example: 'https://logo.url/logo.png', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class JobResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Software Engineer' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Develop awesome features', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'React, Node.js', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({ example: 'Health insurance, free lunch', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  @Expose()
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ enum: JobLevel, example: JobLevel.JUNIOR })
  @Expose()
  @IsEnum(JobLevel)
  level: JobLevel;

  @ApiProperty({ enum: JobStatus, example: JobStatus.OPEN })
  @Expose()
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiProperty({ example: 1000, required: false })
  @Expose()
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ example: 2000, required: false })
  @Expose()
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ example: '2026-08-12T16:40:43Z', required: false })
  @Expose()
  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({ example: '2026-07-12T16:40:43Z', required: false })
  @Expose()
  @IsDate()
  @IsOptional()
  openedAt?: Date;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty({ example: false })
  @Expose()
  @IsBoolean()
  isPinned: boolean;

  @ApiProperty({ example: 'Ho Chi Minh' })
  @Expose()
  @IsString()
  location: string;

  @ApiProperty({ example: ['IT', 'Engineering'], type: [String] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  departments: string[];

  @ApiProperty({ type: () => JobTeamResponseDto, required: false })
  @Expose()
  @Type(() => JobTeamResponseDto)
  @IsOptional()
  team?: JobTeamResponseDto;

  @ApiProperty({ example: '2026-07-12T16:40:43Z' })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2026-07-12T16:40:43Z' })
  @Expose()
  @IsDate()
  updatedAt: Date;
}
