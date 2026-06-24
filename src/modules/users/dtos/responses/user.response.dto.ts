import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ERole, ETeamRole, ETeamType } from '@/common/enums';

export class UserCurrentTeamResponseDto {
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
  @ApiProperty({ enum: ETeamRole, example: ETeamRole.OWNER })
  @Expose()
  @IsEnum(ETeamRole)
  teamRole: ETeamRole;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

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

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty({ enum: ETeamRole, example: ETeamRole.OWNER, required: false })
  @Expose()
  @IsOptional()
  teamRole?: ETeamRole;

  @ApiProperty({ example: 1, required: false })
  @Expose()
  @IsNumber()
  @IsOptional()
  currentTeamId?: number;

  @ApiProperty({ type: () => UserCurrentTeamResponseDto, required: false })
  @Expose()
  @Type(() => UserCurrentTeamResponseDto)
  @IsOptional()
  currentTeam?: UserCurrentTeamResponseDto;
}
