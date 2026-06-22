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
import { TeamDetailDto, TeamSwitchResponseDto } from '../dtos/response';
import { ApiResponseDto } from '@/common/response';

@ApiTags('Teams')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRequestService: TeamRequestService,
  ) {}

  @Get('/')
  @ApiEndpoint({
    summary: '',
    serialization: [TeamDetailDto],
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  async getTeams(
    @AuthUser() user: IAuthUser,
  ): Promise<ApiResponseDto<TeamDetailDto[]>> {
    return this.teamService.getTeams(user);
  }

  @Get(':teamId/invite')
  async getInvite(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.teamService.getInviteCode(teamId);
  }

  @Post('/create-team')
  @ApiEndpoint({
    summary: '',
    httpStatus: HttpStatus.OK,
    messageKey: 'Successfully created team',
  })
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

  @Post('switch/:teamId')
  @ApiEndpoint({
    summary: '',
    serialization: TeamSwitchResponseDto,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  async switchTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.switchTeam(teamId, user);
  }
}
