import { ETeamRequestStatus } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class JoinTeamByCodeDto {
  @ApiProperty()
  @IsString()
  @Length(6, 20)
  inviteCode: string;
}

export class JoinRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: ETeamRequestStatus,
    required: false,
    default: ETeamRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ETeamRequestStatus)
  status?: ETeamRequestStatus;
}
