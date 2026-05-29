import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
import { TeamRequestEntity, UserEntity } from '@/common/entities';
import { ETeamRequestStatus } from '@/common/enums';
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
      this.userRepo.findOneBy({ id: authUser.userId }),
    ]);

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    if (user.teamId) throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

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
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamRequestResponseDto[]>> {
    const team = await this.teamRepo.findOneBy({ id: authUser.teamId });

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    const result = await this.helperQuery.findAll(
      this.teamRequestRepo.repository,
      {
        where: {
          team: { id: team.id },
          status: query.status,
        },
        relations: {
          user: true,
        },
      },
    );
    return ApiResponseDto.success(TeamRequestMapper.mapFromArray(result));
  }

  async approveJoinRequest(requestId: number): Promise<ApiGenericResponseDto> {
    const request = await this.findRequestById(requestId);

    if (request.status !== ETeamRequestStatus.PENDING) {
      throw new BadRequestException(ERROR_TEAM.REQUEST_ALREADY_PROCESSED);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(UserEntity, request.user.id, {
        teamId: request.team.id,
      });
      await manager.update(TeamRequestEntity, request.id, {
        status: ETeamRequestStatus.APPROVED,
      });
    });

    return ApiGenericResponseDto.success();
  }

  async rejectJoinRequest(requestId: number): Promise<ApiGenericResponseDto> {
    const request = await this.findRequestById(requestId);

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
