import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { TeamRoles } from '@/common/guard/decorator/guard.role.decorator';
import { ETeamRole } from '@/common/enums';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { TeamInfoResponseDto } from '../dtos/response';

@ApiTags('Teams')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRequestService: TeamRequestService,
  ) {}

  @Get('/info')
  @ApiEndpoint({
    summary: '',
    serialization: TeamInfoResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  async getTeam(@AuthUser() user: IAuthUser) {
    return this.teamService.getTeamInfo(user);
  }

  @Get(':teamId/invite')
  async getInvite(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.teamService.getInviteCode(teamId);
  }

  @Post('/create-team')
  async createTeam(@Body() query: CreateTeamDto, @AuthUser() user: IAuthUser) {
    return this.teamService.createTeam(query, user);
  }

  @Post('/join/:code')
  async joinTeamById(@Param('code') code: string, @AuthUser() user: IAuthUser) {
    return this.teamRequestService.joinByCode({ inviteCode: code }, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Get(':teamId/join-requests')
  async getJoinRequests(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Query() query: JoinRequestDto,
  ) {
    return this.teamRequestService.getJoinRequests(teamId, query);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Post(':teamId/join-requests/:id/approve')
  async approveJoinRequest(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teamRequestService.approveJoinRequest(teamId, id);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Post(':teamId/join-requests/:id/reject')
  async rejectJoinRequest(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teamRequestService.rejectJoinRequest(teamId, id);
  }

  @Post(':teamId/leave')
  async leaveTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.leaveTeam(teamId, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Delete(':teamId/members/:id')
  async removeMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.removeMember(teamId, id, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Delete(':teamId')
  async deleteTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.deleteTeam(teamId, user);
  }
}
