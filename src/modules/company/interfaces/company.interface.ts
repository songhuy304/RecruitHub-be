import { IAuthUser } from '@/common/request/interfaces';
import { CompanyGetAllMemberDto } from '../dtos/requests/company.get.request';
import { PaginatedResponseDto } from '@/common/response';
import { CompanyMemberDto } from '../dtos/response/company.get.response.dto';

export interface ICompanyService {
  findAllMember(
    payload: CompanyGetAllMemberDto,
    userData: IAuthUser,
  ): Promise<PaginatedResponseDto<CompanyMemberDto>>;
}
