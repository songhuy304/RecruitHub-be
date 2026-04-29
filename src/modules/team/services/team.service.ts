import { Injectable, Logger } from '@nestjs/common';
import { ITeamService } from '../interfaces/team.interface';
import {
  ApiGenericResponseDto,
  ApiResponseDto,
  PaginatedResponseDto,
} from '@/common/response';
import { IAuthUser } from '@/common/request/interfaces';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { TeamMemberDto } from '../dtos/response/team.get.response.dto';
import { MemberMapper } from '../mappers';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import {
  CreateTeamDto,
  GetAllMemberDto,
  JoinTeamByCodeDto,
} from '../dtos/requests';
import { generateCode } from '@/common/utils';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { ETeamRole } from '@/common/enums';
import { ERROR_USER } from '@/common/constants';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
  ) {}

  async findAllMember(
    payload: GetAllMemberDto,
    userData: IAuthUser,
  ): Promise<PaginatedResponseDto<TeamMemberDto>> {
    const user = await this.userRepo.findOneBy({
      id: userData.userId,
    });

    if (!user) {
      return PaginatedResponseDto.success([], null);
    }

    const data = await this.userRepo.findAll(
      { limit: payload.limit, page: payload.page },
      {
        filters: [
          {
            field: 'fullName',
            op: 'ilike',
            value: payload.fullName,
          },
        ],
      },
    );

    const dataMapper = MemberMapper.toResponses(data.data ?? []);

    return PaginatedResponseDto.success(dataMapper, data.meta);
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const user = await this.userRepo.findOneBy({
        id: authUser.userId,
      });

      if (user.teamId)
        throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

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
  ): Promise<ApiResponseDto<string | null>> {
    const user = await this.userRepo.findOne({
      where: { id: payload.userId },
      relations: ['team'],
    });

    if (!user) throw new NotFoundException();

    return ApiResponseDto.success(user.team?.inviteCode ?? null);
  }

  async joinByCode(
    payload: JoinTeamByCodeDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    const team = await this.teamRepo.findOneBy({
      inviteCode: payload.inviteCode,
    });

    if (!team) throw new NotFoundException();

    const user = await this.userRepo.findOne({
      where: { id: authUser.userId },
      select: ['id', 'teamRole'],
      relations: ['team'],
    });

    if (!user) throw new NotFoundException();

    if (user.team) {
      throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
    }

    await this.userRepo.update(authUser.userId, {
      team,
      teamRole: ETeamRole.MEMBER,
    });

    return ApiGenericResponseDto.success();
  }
}
