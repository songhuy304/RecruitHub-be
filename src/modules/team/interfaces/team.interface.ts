import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { InviteCodeResponseDto, TeamResponseDto } from '../dtos/response';
import { CreateTeamDto } from '../dtos/requests';
export interface ITeamService {
  getTeamInfo(authUser: IAuthUser): Promise<ApiResponseDto<TeamResponseDto>>;

  createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  getInviteCode(
    payload: IAuthUser,
  ): Promise<ApiResponseDto<InviteCodeResponseDto | null>>;

  leaveTeam(authUser: IAuthUser): Promise<ApiGenericResponseDto>;

  removeMember(
    userId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  deleteTeam(authUser: IAuthUser): Promise<ApiGenericResponseDto>;
}
