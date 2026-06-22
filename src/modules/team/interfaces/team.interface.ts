import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { CreateTeamDto } from '../dtos/requests';
import { InviteCodeResponseDto } from '../dtos/response';
export interface ITeamService {
  createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  getInviteCode(
    teamId: number,
    payload: IAuthUser,
  ): Promise<ApiResponseDto<InviteCodeResponseDto | null>>;

  leaveTeam(
    teamId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  removeMember(
    teamId: number,
    userId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  deleteTeam(
    teamId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;
}
