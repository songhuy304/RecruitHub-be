import { REGEX_PASSWORD } from '@/common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public identifier: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_PASSWORD)
  public password: string;
}
