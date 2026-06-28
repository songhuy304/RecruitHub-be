import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class TeamMembersDto extends PaginationRequestDto {
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ type: 'number', required: true })
  @IsNumber()
  @Type(() => Number)
  teamId: number;
}
