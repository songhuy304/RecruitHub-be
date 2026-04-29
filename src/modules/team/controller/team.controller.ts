import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TeamService } from '../services/team.service';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';
import { CreateTeamDto, GetAllMemberDto } from '../dtos/requests';

@ApiTags('Team')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  async findAllMember(
    @Body() query: GetAllMemberDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.findAllMember(query, user);
  }

  @Get('invite')
  async getInvite(@AuthUser() user: IAuthUser) {
    return this.teamService.getInviteCode(user);
  }

  @Post()
  async createTeam(@Body() query: CreateTeamDto, @AuthUser() user: IAuthUser) {
    return this.teamService.createTeam(query, user);
  }
}
