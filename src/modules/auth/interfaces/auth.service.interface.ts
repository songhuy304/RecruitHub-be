import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { LoginDto, SignupDto } from '../dtos/request';
import { AuthRefreshResponseDto, LoginResponseDto } from '../dtos/response';

export interface IAuthService {
  login(payload: LoginDto): Promise<ApiResponseDto<LoginResponseDto>>;
  signup(payload: SignupDto): Promise<ApiGenericResponseDto>;
  refreshTokens(
    payload: IAuthUser,
    refreshToken: string,
  ): Promise<AuthRefreshResponseDto>;
  logout(payload: IAuthUser): Promise<ApiGenericResponseDto>;
}
