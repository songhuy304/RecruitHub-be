import { ERole, ETeamRole } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class TeamMemberDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'john_doe' })
  @Expose()
  @IsString()
  userName: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'https://avatar.com/a.png', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ enum: ERole, example: ERole.MEMBER })
  @Expose()
  @IsEnum(ERole)
  role: ERole;

  @ApiProperty({ enum: ETeamRole, example: ETeamRole.OWNER })
  @Expose()
  @IsEnum(ETeamRole)
  teamRole: ETeamRole;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  isVerified: boolean;
}

export class TeamInfoResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Backend Team' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ example: 'ABC123' })
  @Expose()
  @IsString()
  inviteCode: string;

  @ApiProperty({ example: 'my-team' })
  @Expose()
  @IsString()
  slug: string;
}

export class InviteCodeResponseDto {
  @ApiProperty({ example: 'ABC123' })
  @Expose()
  @IsString()
  inviteCode: string;
}
