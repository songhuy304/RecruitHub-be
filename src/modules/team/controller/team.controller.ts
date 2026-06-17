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

  @Get('/invite')
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

  @TeamRoles(ETeamRole.OWNER)
  @Get('/join-requests')
  async getJoinRequests(
    @Query() query: JoinRequestDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamRequestService.getJoinRequests(query, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Post('/join-requests/:id/approve')
  async approveJoinRequest(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamRequestService.approveJoinRequest(id, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Post('/join-requests/:id/reject')
  async rejectJoinRequest(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamRequestService.rejectJoinRequest(id, user);
  }

  @Post('/leave')
  async leaveTeam(@AuthUser() user: IAuthUser) {
    return this.teamService.leaveTeam(user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Delete('/members/:id')
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: IAuthUser,
  ) {
    return this.teamService.removeMember(id, user);
  }

  @TeamRoles(ETeamRole.OWNER)
  @Delete()
  async deleteTeam(@AuthUser() user: IAuthUser) {
    return this.teamService.deleteTeam(user);
  }
}
