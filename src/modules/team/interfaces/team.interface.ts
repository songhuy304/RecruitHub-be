import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { CreateTeamDto, InviteMembersDto } from '../dtos/requests';
import { TeamDetailDto, TeamSwitchResponseDto } from '../dtos/response';

export interface ITeamService {
  getTeams(authUser: IAuthUser): Promise<ApiResponseDto<TeamDetailDto[]>>;

  createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;

  invitations(payload: InviteMembersDto): Promise<ApiResponseDto<void>>;

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

  switchTeam(
    teamId: number,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamSwitchResponseDto>>;
}
