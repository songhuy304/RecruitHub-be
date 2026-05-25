import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
import { ETeamRequestStatus, ETeamRole } from '@/common/enums';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { generateCode } from '@/common/utils';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateTeamDto,
  JoinRequestDto,
  JoinTeamByCodeDto,
} from '../dtos/requests';
import { InviteCodeResponseDto, TeamResponseDto } from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamMapper } from '../mappers';
import { TeamRequestRepository } from '../repositories/team-request.repository';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly teamRequestRepo: TeamRequestRepository,
    private readonly helperQuery: HelperQueryService,
  ) {}

  async getTeam(authUser: IAuthUser): Promise<ApiResponseDto<TeamResponseDto>> {
    const user = await this.userRepo.findOneBy({ id: authUser.userId });

    if (!user.teamId) {
      return ApiResponseDto.success(null);
    }

    const team = await this.teamRepo.findOne({
      where: { id: user.teamId },
      relations: ['users'],
    });

    const dataMapper = TeamMapper.toResponse(team);

    return ApiResponseDto.success(dataMapper);
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const user = await this.userRepo.findOneBy({
        id: authUser.userId,
      });

      if (user.teamId) {
        throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
      }

      const team = await this.teamRepo.create({
        ...payload,
        createdById: authUser.userId,
        inviteCode: generateCode(6),
      });

      await this.userRepo.update(authUser.userId, {
        team,
        teamRole: ETeamRole.OWNER,
      });

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getInviteCode(
    payload: IAuthUser,
  ): Promise<ApiResponseDto<InviteCodeResponseDto | null>> {
    const user = await this.userRepo.findOne({
      where: { id: payload.userId },
      relations: ['team'],
    });

    if (!user) throw new NotFoundException();

    return ApiResponseDto.success({
      inviteCode: user.team.inviteCode ? user.team.inviteCode : null,
    });
  }

  async joinByCode(
    payload: JoinTeamByCodeDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    if (authUser.teamId) {
      throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
    }

    const [team, user] = await Promise.all([
      this.teamRepo.findOneBy({ inviteCode: payload.inviteCode }),
      this.userRepo.findOneBy({ id: authUser.userId }),
    ]);

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    if (user.teamId) throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

    const existedRequest = await this.teamRequestRepo.exists({
      team: { id: team.id },
      user: { id: user.id },
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

  async getJoinRequests(query: JoinRequestDto, authUser: IAuthUser) {
    const team = await this.teamRepo.findOneBy({ id: authUser.teamId });

    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    return this.helperQuery.findAll(this.teamRequestRepo.repository, {
      where: {
        team: { id: team.id },
        status: query.status,
      },
    });
  }

  async approveJoinRequest(idRequest: number): Promise<ApiGenericResponseDto> {
    const request = await this.teamRequestRepo.findOne({
      where: { id: idRequest },
      relations: ['team', 'user'],
    });
    if (!request) throw new NotFoundException(ERROR_TEAM.REQUEST_NOT_FOUND);

    const existingUser = await this.userRepo.existsTeam(request.team.id);
    if (existingUser) {
      throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
    }

    const team = await this.teamRepo.findOneBy({ id: request.team.id });
    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    await Promise.all([
      this.userRepo.update(request.user.id, {
        teamId: team.id,
      }),
      this.teamRequestRepo.update(request.id, {
        status: ETeamRequestStatus.APPROVED,
      }),
    ]);

    return ApiGenericResponseDto.success();
  }
}
