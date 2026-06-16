import { ETOKEN_TYPE } from '@/common/enums';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTokenDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsEnum(ETOKEN_TYPE)
  type: ETOKEN_TYPE;
}

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(ETOKEN_TYPE)
  type: ETOKEN_TYPE;
}

export class VerifyTokenDto extends GetTokenDto {}
