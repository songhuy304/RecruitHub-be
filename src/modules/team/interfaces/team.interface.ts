import { IAuthUser } from '@/common/request/interfaces';
import { PaginatedResponseDto } from '@/common/response';
import { TeamMemberDto } from '../dtos/response/team.get.response.dto';
import { GetAllMemberDto } from '../dtos/requests';

export interface ITeamService {
  findAllMember(
    payload: GetAllMemberDto,
    userData: IAuthUser,
  ): Promise<PaginatedResponseDto<TeamMemberDto>>;
}
