import { ApiResponseDto } from '@/common/response';
import { UserResponseDto } from '../dtos/reponse';
import { IAuthUser } from '@/common/request/interfaces';
export interface IUserService {
  getProfile(payload: IAuthUser): Promise<ApiResponseDto<UserResponseDto>>;
}
