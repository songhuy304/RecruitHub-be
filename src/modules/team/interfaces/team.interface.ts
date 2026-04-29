import { IAuthUser } from '@/common/request/interfaces';
import { ApiResponseDto } from '@/common/response';
import { TeamResponseDto } from '../dtos/response';

export interface ITeamService {
  getTeam(userData: IAuthUser): Promise<ApiResponseDto<TeamResponseDto>>;
}
