import { EAuthProvider } from '@/common/enums';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class UserOauthDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  avatar: string;

  @IsEnum(EAuthProvider)
  provider: EAuthProvider;
}
