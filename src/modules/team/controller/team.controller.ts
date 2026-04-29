import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TeamService } from '../services/team.service';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';
import { CreateTeamDto } from '../dtos/requests';

@ApiTags('Team')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('')
  async getTeam(@AuthUser() user: IAuthUser) {
    return this.teamService.getTeam(user);
  }

  @Get('invite')
  async getInvite(@AuthUser() user: IAuthUser) {
    return this.teamService.getInviteCode(user);
  }

  @Post()
  async createTeam(@Body() query: CreateTeamDto, @AuthUser() user: IAuthUser) {
    return this.teamService.createTeam(query, user);
  }

  @Post('/join/:code')
  async joinTeamById(@Param('code') code: string, @AuthUser() user: IAuthUser) {
    return this.teamService.joinByCode({ inviteCode: code }, user);
  }
}
