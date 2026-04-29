import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAllMemberDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'Filter by full name',
    example: 'John Doe',
  })
  fullName?: string;
}
