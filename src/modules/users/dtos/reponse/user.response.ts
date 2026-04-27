import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/common/entities/user.entity';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsString, IsUUID } from 'class-validator';
import { ERole } from '../../../../common/enums';

export class UserResponseDto implements Partial<UserEntity> {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsUUID()
  id: number;

  @ApiProperty({ example: 'john123' })
  @Expose()
  @IsString()
  userName: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Expose()
  fullName: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @Expose()
  isVerified: boolean;

  @ApiProperty({ enum: ERole, example: ERole.OWNER })
  @IsEnum(ERole)
  @Expose()
  role: ERole;
}
