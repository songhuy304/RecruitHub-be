import { ERole } from '@/common/enums';
import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CompanyGetAllMemberDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'Filter by full name',
    example: 'John Doe',
  })
  fullName?: string;

  @IsOptional()
  @IsEnum(ERole, { each: true })
  @ApiPropertyOptional({
    enum: ERole,
    isArray: true,
    description: 'Filter by roles',
    example: ['ADMIN', 'USER'],
  })
  role?: ERole[];
}
