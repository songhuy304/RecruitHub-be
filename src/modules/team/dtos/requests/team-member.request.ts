import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TeamMemberRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  search?: string;
}
