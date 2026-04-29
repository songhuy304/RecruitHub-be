import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinTeamByCodeDto {
  @ApiProperty()
  @IsString()
  @Length(6, 20)
  inviteCode: string;
}
