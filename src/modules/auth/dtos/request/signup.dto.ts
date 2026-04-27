import { REGEX_PASSWORD } from '@/common/constants';
import { UserEntity } from '@/common/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class SignupDto implements Partial<UserEntity> {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public userName: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_PASSWORD)
  public password: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public fullName: string;

  @IsOptional()
  @IsString()
  public companyName?: string;
}
