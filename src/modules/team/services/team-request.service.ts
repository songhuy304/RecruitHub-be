import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
import { TeamRequestEntity, UserEntity, TeamMemberEntity } from '@/common/entities';
import { ETeamRequestStatus, ETeamRole } from '@/common/enums';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JoinRequestDto, JoinTeamByCodeDto } from '../dtos/requests';
import { TeamRequestResponseDto } from '../dtos/response';
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
    private readonly helperQuery: HelperQueryService,
    private readonly dataSource: DataSource,
  ) {}

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

    const isAlreadyInTeam = user?.teamMembers?.some((m) => m.teamId === team.id);
    if (isAlreadyInTeam) throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

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
    teamId: number,
    query: JoinRequestDto,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamRequestResponseDto[]>> {
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    const result = await this.helperQuery.findAll(
      this.teamRequestRepo.repository,
      {
        where: {
          team: { id: team.id },
          status: query.status,
        },
        relations: {
          user: {
            teamMembers: true,
          },
        },
      },
    );
    return ApiResponseDto.success(TeamRequestMapper.mapFromArray(result));
  }

  async approveJoinRequest(
    teamId: number,
    requestId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
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
    teamId: number,
    requestId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
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
