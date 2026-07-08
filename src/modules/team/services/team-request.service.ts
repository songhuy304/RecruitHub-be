import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
import { TeamMemberEntity, TeamRequestEntity } from '@/common/entities';
import { ETeamRequestStatus, ETeamRole, SortOrder } from '@/common/enums';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, PaginatedResponseDto } from '@/common/response';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApproveJoinRequestDto, JoinRequestDto, JoinTeamByCodeDto, RejectJoinRequestDto } from '../dtos/requests';
import { TeamJoinRequestDto } from '../dtos/response';
import { ITeamRequestService } from '../interfaces/team-request.interface';
import { TeamRequestMapper } from '../mappers';
import { TeamMemberRepository } from '../repositories/team-member.repository';
import { TeamRequestRepository } from '../repositories/team-request.repository';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamPermissionService } from './team-permission.service';
import { NotificationSenderService } from '@/modules/notifications/services/notification-sender.service';
import { NotificationType } from '@/modules/notifications/interfaces';

@Injectable()
export class TeamRequestService implements ITeamRequestService {
  constructor(
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly teamMemberRepo: TeamMemberRepository,
    private readonly teamRequestRepo: TeamRequestRepository,
    private readonly teamPermissionService: TeamPermissionService,
    private readonly senderService: NotificationSenderService,
    private readonly dataSource: DataSource,
  ) { }

  async joinByCode(
    payload: JoinTeamByCodeDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    const team = await this.teamRepo.findOneBy({ inviteCode: payload.inviteCode });

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    const teamMember = await this.teamMemberRepo.exists({
      teamId: team.id,
      userId: authUser.userId,
    })

    if (teamMember)
      throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

    const existedRequest = await this.teamRequestRepo.exists({
      team: { id: team.id },
      user: { id: authUser.userId },
      status: ETeamRequestStatus.PENDING,
    });

    if (existedRequest) {
      throw new BadRequestException(ERROR_TEAM.REQUEST_EXIST);
    }

    await this.teamRequestRepo.create({
      status: ETeamRequestStatus.PENDING,
      team,
      user: { id: authUser.userId },
    });

    await this.senderService.notifyUser({
      title: 'New join request',
      content: `User ${authUser.userId} has requested to join your team ${team.name}`,
      type: NotificationType.MEMBER_JOINED_TEAM,
      userId: team.createdById,
    }, {
      teamId: team.id,
      userId: authUser.userId,
    });

    return ApiGenericResponseDto.success();
  }

  async getJoinRequests(
    query: JoinRequestDto,
  ): Promise<PaginatedResponseDto<TeamJoinRequestDto>> {
    const { teamId, name, limit, page } = query;

    const result = await this.teamRequestRepo.findMany({ limit, page }, {
      where: {
        team: {
          id: teamId
        },
      },
      sort: { createdAt: SortOrder.DESC },
      relations: { user: true },
      filters: {
        and: [
          {
            field: 'status',
            op: 'eq',
            value: ETeamRequestStatus.PENDING,
          },
          {
            or: [
              { field: 'user.fullName', op: 'ilike', value: name },
              { field: 'user.email', op: 'ilike', value: name },
            ],
          },
        ],
      }
    })

    const data = TeamRequestMapper.mapFromArray(result.data);
    return PaginatedResponseDto.success(data, result.meta);
  }

  async approveJoinRequest(
    payload: ApproveJoinRequestDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    await this.teamPermissionService.requireOwner(payload.teamId, authUser.userId);

    const { teamId, id: requestId } = payload;
    const request = await this.findRequestById(requestId);

    if (request.team.id !== teamId) {
      throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
    }

    if (request.status !== ETeamRequestStatus.PENDING) {
      throw new BadRequestException(ERROR_TEAM.REQUEST_ALREADY_PROCESSED);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.save(TeamMemberEntity, {
        userId: request.user.id,
        teamId: request.team.id,
        role: ETeamRole.MEMBER,
      });
      await manager.update(TeamRequestEntity, request.id, {
        status: ETeamRequestStatus.APPROVED,
      });
    });

    await this.senderService.notifyUser({
      title: 'Team Join Request Approved',
      content: `Your request to join ${request.team.name} has been approved`,
      type: NotificationType.TEAM_JOIN_REQUEST_APPROVED,
      userId: request.user.id,
    }, {
      teamId: request.team.id,
    });

    return ApiGenericResponseDto.success();
  }

  async rejectJoinRequest(
    payload: RejectJoinRequestDto,
    authUser: IAuthUser
  ): Promise<ApiGenericResponseDto> {
    await this.teamPermissionService.requireOwner(payload.teamId, authUser.userId);

    const { teamId, id: requestId } = payload;
    const request = await this.findRequestById(requestId);

    if (request.team.id !== teamId) {
      throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
    }

    if (request.status !== ETeamRequestStatus.PENDING) {
      throw new BadRequestException(ERROR_TEAM.REQUEST_ALREADY_PROCESSED);
    }

    await this.teamRequestRepo.update(request.id, {
      status: ETeamRequestStatus.REJECTED,
    });

    await this.senderService.notifyUser({
      title: 'Team Join Request Rejected',
      content: `Your request to join ${request.team.name} has been rejected`,
      type: NotificationType.TEAM_JOIN_REQUEST_REJECTED,
      userId: request.user.id,
    }, {
      teamId: request.team.id,
    });


    return ApiGenericResponseDto.success();
  }

  private async findRequestById(idRequest: number) {
    const request = await this.teamRequestRepo.findOne({
      where: { id: idRequest },
      relations: ['team', 'user'],
    });

    if (!request) throw new NotFoundException(ERROR_TEAM.REQUEST_NOT_FOUND);

    return request;
  }
}
