import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EPostStatus } from '../../enums/post-status.enum';

export class ListPostDto extends PaginationRequestDto {
  @ApiPropertyOptional({ enum: EPostStatus })
  @IsEnum(EPostStatus)
  @IsOptional()
  status?: EPostStatus;
}
