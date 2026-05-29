import { IAuthUser } from '@/common/request/interfaces';
import { JoinTeamByCodeDto } from '../dtos/requests';
import { ApiGenericResponseDto } from '@/common/response';

export interface ITeamRequestService {
  joinByCode(
    payload: JoinTeamByCodeDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto>;
}
