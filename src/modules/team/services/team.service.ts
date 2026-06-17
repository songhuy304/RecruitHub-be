import { ERROR_TEAM, ERROR_USER } from '@/common/constants';
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
import { CreateTeamDto } from '../dtos/requests';
import { InviteCodeResponseDto, TeamInfoResponseDto } from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamMapper } from '../mappers';
import { DataSource } from 'typeorm';
import { TeamRequestEntity, UserEntity } from '@/common/entities';
import { TeamEntity } from '@/common/entities/team.entity';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly dataSource: DataSource,
  ) {}

  async getTeamInfo(
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamInfoResponseDto | null>> {
    const user = await this.userRepo.findOne({
      where: {
        id: authUser.userId,
      },
      relations: {
        team: {
          users: true,
        },
      },
    });

    if (!user?.team) {
      return ApiResponseDto.success(null);
    }

    return ApiResponseDto.success(TeamMapper.toResponse(user.team));
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const user = await this.userRepo.findOneBy({ id: authUser.userId });
      if (user?.teamId) {
        throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
      }
      await this.dataSource.transaction(async (manager) => {
        const team = await manager.save(TeamEntity, {
          ...payload,
          createdById: authUser.userId,
          inviteCode: generateCode(6),
        });

        await manager.update(UserEntity, authUser.userId, {
          team,
          teamRole: ETeamRole.OWNER,
        });
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
    if (!user.teamId || !user.team) {
      return ApiResponseDto.success(null);
    }

    return ApiResponseDto.success({
      inviteCode: user.team.inviteCode ? user.team.inviteCode : null,
    });
  }

  async leaveTeam(authUser: IAuthUser) {
    try {
      const user = await this.userRepo.findOneBy({ id: authUser.userId });
      if (!user?.teamId) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }
      const team = await this.teamRepo.findOneBy({ id: user.teamId });

      if (!team) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }
      await this.dataSource.transaction(async (manager) => {
        if (authUser.userId === team.createdById) {
          await manager.update(
            UserEntity,

            { teamId: user.teamId },

            { teamId: null, teamRole: null },
          );

          await manager.delete(TeamRequestEntity, {
            team: { id: user.teamId },
          });
          await manager.delete('teams', { id: user.teamId });
          return;
        }

        await manager.update(UserEntity, authUser.userId, {
          teamId: null,

          teamRole: null,
        });
      });

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async removeMember(
    userId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      if (userId === authUser.userId) {
        throw new BadRequestException(ERROR_TEAM.REQUEST_EXIST);
      }
      const owner = await this.userRepo.findOneBy({ id: authUser.userId });
      if (!owner?.teamId) {
        throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
      }
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(ERROR_USER.NOT_FOUND);
      }
      if (!user.teamId || user.teamId !== owner.teamId) {
        throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
      }
      await this.userRepo.update(userId, {
        teamId: null,
        teamRole: null,
      });

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteTeam(authUser: IAuthUser) {
    try {
      const user = await this.userRepo.findOneBy({ id: authUser.userId });
      if (!user?.teamId) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }
      const team = await this.teamRepo.findOneBy({ id: user.teamId });
      if (!team) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }
      if (team.createdById !== authUser.userId) {
        throw new BadRequestException(ERROR_TEAM.REQUEST_EXIST);
      }
      await this.teamRepo.remove(team.id);
      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // async inviteMember(dto: InviteMembersDto, authUser: IAuthUser) {}
}
