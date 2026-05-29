import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { TeamService } from '../services/team.service';
import { IAuthUser } from '@/common/request/interfaces';
import { AuthUser } from '@/common/guard/decorator';
import { CreateTeamDto, JoinRequestDto } from '../dtos/requests';
import { TeamRequestService } from '../services/team-request.service';

@ApiTags('Teams')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRequestService: TeamRequestService,
  ) {}

  @Get()
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
    return this.teamRequestService.joinByCode({ inviteCode: code }, user);
  }

  @Get('/join-requests')
  async getJoinRequests(
    @Query() query: JoinRequestDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamRequestService.getJoinRequests(query, user);
  }

  @Post('/join-requests/:id/approve')
  async approveJoinRequest(@Param('id', ParseIntPipe) id: number) {
    return this.teamRequestService.approveJoinRequest(id);
  }

  @Post('/join-requests/:id/reject')
  async rejectJoinRequest(@Param('id', ParseIntPipe) id: number) {
    return this.teamRequestService.rejectJoinRequest(id);
  }
}
