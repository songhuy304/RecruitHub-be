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
import {
  CreateTeamResponseDto,
  InviteCodeResponseDto,
  TeamResponseDto,
} from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamMapper } from '../mappers';
import { DataSource } from 'typeorm';
import { TeamRequestEntity, UserEntity } from '@/common/entities';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { TeamEntity } from '@/common/entities/team.entity';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  constructor(
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly dataSource: DataSource,
  ) {}

  async getTeam(
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamResponseDto[]>> {
    const user = await this.userRepo.findOneBy({ id: authUser.userId });

    if (!user.teamId) {
      return ApiResponseDto.success(null);
    }

    const team = await this.teamRepo.findOne({
      where: { id: user.teamId },
      relations: ['users'],
    });
    return ApiResponseDto.success(team ? TeamMapper.toResponse(team) : []);
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<CreateTeamResponseDto>> {
    try {
      if (authUser.teamId) {
        throw new BadRequestException(ERROR_USER.ALREADY_IN_TEAM);
      }

      const token = await this.dataSource.transaction(async (manager) => {
        const team = await manager.save(TeamEntity, {
          ...payload,
          createdById: authUser.userId,
          inviteCode: generateCode(6),
        });

        await manager.update(UserEntity, authUser.userId, {
          team,
          teamRole: ETeamRole.OWNER,
        });

        const token = await this.helperEncryptionService.createJwtTokens({
          userId: authUser.userId,
          role: authUser.role,
          teamRole: ETeamRole.OWNER,
          teamId: team.id,
        });

        const hash = await this.helperEncryptionService.createHash(
          token.refreshToken,
        );
        await manager.update(UserEntity, authUser.userId, {
          refreshToken: hash,
        });

        return token;
      });

      return ApiResponseDto.success(token);
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
      const team = await this.teamRepo.findOneBy({ id: authUser.teamId });

      if (!team) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }

      await this.dataSource.transaction(async (manager) => {
        if (authUser.userId === team.createdById) {
          await manager.update(
            UserEntity,
            { teamId: authUser.teamId },
            { teamId: null, teamRole: null },
          );

          await manager.delete(TeamRequestEntity, {
            team: { id: authUser.teamId },
          });

          await manager.delete('teams', { id: authUser.teamId });

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

      const user = await this.userRepo.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException(ERROR_USER.NOT_FOUND);
      }

      if (!user.teamId || user.teamId !== authUser.teamId) {
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
      const team = await this.teamRepo.findOneBy({ id: authUser.teamId });
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
