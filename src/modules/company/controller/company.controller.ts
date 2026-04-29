import { Body, Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CompanyService } from '../services/company.service';
import { CompanyGetAllMemberDto } from '../dtos/requests/company.get.request';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';

@ApiTags('Company')
@ApiBearerAuth('accessToken')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('members')
  async findAllMember(
    @Body() query: CompanyGetAllMemberDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.companyService.findAllMember(query, user);
  }
}
