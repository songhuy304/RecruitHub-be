import { ETeamType } from '@/common/enums';
import { UserResponseDto } from '@/modules/users/dtos/responses/user.response.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class TeamMemberDto extends OmitType(UserResponseDto, [
  'currentTeam',
  'currentTeamId',
]) {}

export class TeamDetailDto {
  @ApiProperty({ type: 'number' })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ type: 'string' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  @IsString()
  inviteCode: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ type: 'string' })
  @Expose()
  @IsString()
  slug: string;

  @ApiProperty({ enum: ETeamType, example: ETeamType.PERSONAL })
  @Expose()
  @IsEnum(ETeamType)
  type: ETeamType;

  // @ApiProperty({
  //   type: [TeamMemberDto],
  // })
  // @Expose()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => TeamMemberDto)
  // members: TeamMemberDto[];
}

export class InviteCodeResponseDto {
  @ApiProperty({ type: 'string' })
  @Expose()
  @IsString()
  inviteCode: string;
}
