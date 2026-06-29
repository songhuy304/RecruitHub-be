import { ETeamRequestStatus } from '@/common/enums';
import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class JoinTeamByCodeDto {
  @ApiProperty()
  @IsString()
  @Length(6, 20)
  inviteCode: string;
}

export class JoinRequestDto extends PaginationRequestDto {
  @ApiProperty({
    required: true,
    type: 'number',
  })
  @IsNumber()
  @Type(() => Number)
  teamId: number;

  @ApiProperty({ required: false })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: ETeamRequestStatus,
    required: false,
    default: ETeamRequestStatus.PENDING,
  })
  @ApiPropertyOptional({
    enum: ETeamRequestStatus,
    default: ETeamRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ETeamRequestStatus)
  status?: ETeamRequestStatus;
}
