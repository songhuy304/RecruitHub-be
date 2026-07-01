import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
import { TeamMemberEntity, TeamRequestEntity } from '@/common/entities';
import { ETeamRequestStatus, ETeamRole, SortOrder } from '@/common/enums';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, PaginatedResponseDto } from '@/common/response';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApproveJoinRequestDto, JoinRequestDto, JoinTeamByCodeDto, RejectJoinRequestDto } from '../dtos/requests';
import { TeamJoinRequestDto } from '../dtos/response';
import { ITeamRequestService } from '../interfaces/team-request.interface';
import { TeamRequestMapper } from '../mappers';
import { TeamRequestRepository } from '../repositories/team-request.repository';
import { TeamRepositoryImpl } from '../repositories/team.repository';

@Injectable()
export class TeamRequestService implements ITeamRequestService {
  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly teamRequestRepo: TeamRequestRepository,
    private readonly dataSource: DataSource,
  ) { }

  async joinByCode(
    payload: JoinTeamByCodeDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    const [team, user] = await Promise.all([
      this.teamRepo.findOneBy({ inviteCode: payload.inviteCode }),
      this.userRepo.findOne({
        where: { id: authUser.userId },
        relations: ['teamMembers'],
      }),
    ]);

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    const isAlreadyInTeam = user?.teamMembers?.some(
      (m) => m.teamId === team.id,
    );
    if (isAlreadyInTeam)
      throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

    const existedRequest = await this.teamRequestRepo.exists({
      team: { id: team.id },
      user: { id: user.id },
      status: ETeamRequestStatus.PENDING,
    });

    if (existedRequest) {
      throw new BadRequestException(ERROR_TEAM.REQUEST_EXIST);
    }

    await this.teamRequestRepo.create({
      status: ETeamRequestStatus.PENDING,
      team,
      user,
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
        status: ETeamRequestStatus.PENDING
      },
      sort: { createdAt: SortOrder.DESC },
      relations: { user: true },
      filters: {
        or: [
          { field: 'user.fullName', op: 'ilike', value: name },
          { field: 'user.email', op: 'ilike', value: name },
        ],
      }
    })

    const data = TeamRequestMapper.mapFromArray(result.data);
    return PaginatedResponseDto.success(data, result.meta);
  }

  async approveJoinRequest(
    payload: ApproveJoinRequestDto
  ): Promise<ApiGenericResponseDto> {
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

    return ApiGenericResponseDto.success();
  }

  async rejectJoinRequest(
    payload: RejectJoinRequestDto
  ): Promise<ApiGenericResponseDto> {
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
