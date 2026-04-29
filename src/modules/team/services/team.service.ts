import { ERROR_USER } from '@/common/constants';
import { ETeamRole } from '@/common/enums';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { generateCode } from '@/common/utils';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { CreateTeamDto, JoinTeamByCodeDto } from '../dtos/requests';
import { TeamResponseDto } from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamMapper } from '../mappers';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
  ) {}

  async getTeam(authUser: IAuthUser): Promise<ApiResponseDto<TeamResponseDto>> {
    const user = await this.userRepo.findOneBy({ id: authUser.userId });

    const team = await this.teamRepo.findOne({
      where: { id: user.teamId },
      relations: ['users']
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
    const [team, user] = await Promise.all([
      this.teamRepo.findOneBy({ inviteCode: payload.inviteCode }),
      this.userRepo.findOneBy({ id: authUser.userId }),
    ]);

    if (user.teamId) throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);

    await this.userRepo.update(authUser.userId, {
      team,
      teamRole: ETeamRole.MEMBER,
    });

    return ApiGenericResponseDto.success();
  }
}
