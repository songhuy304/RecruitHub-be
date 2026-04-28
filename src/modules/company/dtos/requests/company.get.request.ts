import { ERole } from '@/common/enums';
import { PaginationRequestDto } from '@/common/request/dtos';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CompanyGetAllMemberDto extends PaginationRequestDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum([ERole], { each: true })
  role?: ERole[];
}
