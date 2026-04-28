import { Injectable, Logger } from '@nestjs/common';
import { CompanyRepositoryImpl } from '../repositories/company.repository';
import { ICompanyService } from '../interfaces/company.interface';
import { CompanyGetAllMemberDto } from '../dtos/requests/company.get.request';
import { PaginatedResponseDto } from '@/common/response';
import { IAuthUser } from '@/common/request/interfaces';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { CompanyMemberDto } from '../dtos/response/company.get.response.dto';

@Injectable()
export class CompanyService implements ICompanyService {
  private readonly logger = new Logger(CompanyService.name);
  constructor(private readonly userRepo: UserRepositoryImpl) {}

  async findAllMember(
    payload: CompanyGetAllMemberDto,
    userData: IAuthUser,
  ): Promise<PaginatedResponseDto<CompanyMemberDto>> {
    const user = await this.userRepo.findOne({
      id: userData.userId,
    });

    if (!user) {
      return PaginatedResponseDto.success([], null);
    }

    const data = await this.userRepo.findAll(
      { limit: payload.limit, page: payload.page },
      {
        filters: [
          {
            field: 'fullName',
            op: 'ilike',
            value: payload.fullName,
          },
        ],
      },
    );

    return PaginatedResponseDto.success(data.data, data.meta);
  }

  async getCoundMember() {}
}
