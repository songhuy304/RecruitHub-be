import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiResponseDto } from '@/common/response';
import {
  ApproveJoinRequestDto,
  CreateTeamDto,
  InviteMembersDto,
  JoinRequestDto,
  RejectJoinRequestDto,
  UpdateTeamDto,
  UpdateTeamMemberDto,
} from '../dtos/requests';
import { TeamMembersDto } from '../dtos/requests/team-member.request';
import {
  TeamDetailDto,
  TeamJoinRequestDto,
  TeamMemberGetDto,
  TeamStatisticsDTO,
  TeamSwitchResponseDto,
} from '../dtos/response';
import { TeamRequestService } from '../services/team-request.service';
import { TeamService } from '../services/team.service';

@ApiTags('Teams')
@ApiBearerAuth('accessToken')
@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRequestService: TeamRequestService,
  ) { }

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

  @Post('/invitations')
  async invitations(@Body() payload: InviteMembersDto) {
    return this.teamService.invitations(payload);
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


  @Patch(':teamId')
  @ApiEndpoint({
    summary: '',
    httpStatus: HttpStatus.OK,
    messageKey: 'Successfully updated team',
  })
  async updateTeam(@Body() query: UpdateTeamDto, @Param('teamId', ParseIntPipe) teamId: number, @AuthUser() user: IAuthUser) {
    return this.teamService.updateTeam(query, teamId, user);
  }

  @Post('/join/:code')
  async joinTeamById(@Param('code') code: string, @AuthUser() user: IAuthUser) {
    return this.teamRequestService.joinByCode({ inviteCode: code }, user);
  }

  @Get('/join-requests')
  @ApiEndpoint({
    summary: '',
    serialization: [TeamJoinRequestDto],
    isArray: true,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  async getJoinRequests(@Query() query: JoinRequestDto) {
    return this.teamRequestService.getJoinRequests(query);
  }

  @Post('/join-requests/approve')
  async approveJoinRequest(@Body() payload: ApproveJoinRequestDto, @AuthUser() user: IAuthUser) {
    return this.teamRequestService.approveJoinRequest(payload, user);
  }

  @Post('/join-requests/reject')
  async rejectJoinRequest(@Body() payload: RejectJoinRequestDto, @AuthUser() user: IAuthUser) {
    return this.teamRequestService.rejectJoinRequest(payload, user);
  }

  @Post('/leave')
  async leaveTeam(
    @Body() payload: { teamId: number },
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.leaveTeam(payload.teamId, user);
  }

  @Delete(':teamId/members/:id')
  async removeMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.removeMember(teamId, id, user);
  }

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

  @Get(':teamId/statistics')
  @ApiEndpoint({
    summary: '',
    serialization: TeamStatisticsDTO,
    httpStatus: HttpStatus.OK,
    messageKey: '',
  })
  async getTeamStatistics(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.teamService.getTeamStatistics(teamId);
  }

  @Get('/members')
  @ApiEndpoint({
    summary: '',
    serialization: TeamMemberGetDto,
    httpStatus: HttpStatus.OK,
    isArray: true,
    messageKey: '',
  })
  async getTeamMembers(@Query() query: TeamMembersDto) {
    return this.teamService.getTeamMembers(query);
  }

  @Patch(':teamId/members/:userId')
  async updateMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: UpdateTeamMemberDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.updateMemberRole(teamId, userId, payload, user);
  }
}
