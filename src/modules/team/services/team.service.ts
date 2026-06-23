import { ERROR_TEAM } from '@/common/constants';
import { TeamMemberEntity, TeamRequestEntity } from '@/common/entities';
import { TeamEntity } from '@/common/entities/team.entity';
import { ETeamRole, ETeamType } from '@/common/enums';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@/common/filters/exception';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { generateCode } from '@/common/utils';
import { TeamMemberRepository } from '@/modules/team/repositories/team-member.repository';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateTeamDto } from '../dtos/requests';
import {
  InviteCodeResponseDto,
  TeamDetailDto,
  TeamSwitchResponseDto,
} from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamMapper } from '../mappers';
import { TeamRepositoryImpl } from '../repositories/team.repository';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  private LIMIT_TEAM = 5;

  constructor(
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamMemberRepo: TeamMemberRepository,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly dataSource: DataSource,
  ) {}

  async getTeams(
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamDetailDto[]>> {
    const teams = await this.teamRepo.findAll({
      where: {
        members: {
          userId: authUser.userId,
        },
      },
      relations: {
        members: true,
      },
    });

    if (!teams || teams.length === 0) {
      return ApiResponseDto.success([]);
    }

    return ApiResponseDto.success(TeamMapper.toResponseList(teams));
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      const countTeam = await this.teamMemberRepo.count({
        where: {
          userId: authUser.userId,
        },
      });

      if (countTeam > this.LIMIT_TEAM) {
        throw new BadRequestException(ERROR_TEAM.EXCEED_LIMIT);
      }

      await this.dataSource.transaction(async (manager) => {
        const team = await manager.save(
          manager.create(TeamEntity, {
            ...payload,
            createdById: authUser.userId,
            inviteCode: generateCode(6),
            type: ETeamType.ORGANIZATION,
          }),
        );

        await manager.save(TeamMemberEntity, {
          userId: authUser.userId,
          teamId: team.id,
          role: ETeamRole.OWNER,
        });
      });

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getInviteCode(
    teamId: number,
  ): Promise<ApiResponseDto<InviteCodeResponseDto | null>> {
    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (!team) throw new NotFoundException(ERROR_TEAM.NOT_FOUND);

    return ApiResponseDto.success({
      inviteCode: team.inviteCode ? team.inviteCode : null,
    });
  }

  async leaveTeam(teamId: number, authUser: IAuthUser) {
    try {
      const team = await this.teamRepo.findOneBy({ id: teamId });
      if (!team) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }

      const member = await this.teamMemberRepo.findOneBy({
        userId: authUser.userId,
        teamId,
      });
      if (!member) {
        throw new NotFoundException(ERROR_TEAM.NOT_IN_TEAM);
      }

      await this.dataSource.transaction(async (manager) => {
        if (authUser.userId === team.createdById) {
          await manager.delete(TeamMemberEntity, { teamId });
          await manager.delete(TeamRequestEntity, { team: { id: teamId } });
          await manager.delete(TeamEntity, { id: teamId });
        } else {
          await manager.delete(TeamMemberEntity, { id: member.id });
        }
      });

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async removeMember(
    teamId: number,
    userId: number,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      if (userId === authUser.userId) {
        throw new BadRequestException(ERROR_TEAM.REQUEST_EXIST);
      }
      const team = await this.teamRepo.findOneBy({ id: teamId });
      if (!team) {
        throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
      }

      const member = await this.teamMemberRepo.findOneBy({
        userId,
        teamId,
      });

      if (!member) {
        throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
      }

      await this.teamMemberRepo.remove(member.id);

      return ApiGenericResponseDto.success();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async deleteTeam(teamId: number, authUser: IAuthUser) {
    try {
      const team = await this.teamRepo.findOneBy({ id: teamId });
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

  public async switchTeam(
    teamId: number,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<TeamSwitchResponseDto>> {
    if (teamId === authUser.teamId) {
      throw new BadRequestException(ERROR_TEAM.SAME_TEAM);
    }
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team) {
      throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    }

    const teamMember = await this.teamMemberRepo.findOneBy({
      userId: authUser.userId,
      teamId: teamId,
    });

    const token = await this.helperEncryptionService.createJwtTokens({
      userId: authUser.userId,
      role: authUser.role,
      teamId: team.id,
    });

    if (!teamMember) {
      throw new ForbiddenException(ERROR_TEAM.NOT_IN_TEAM);
    }

    await this.userRepo.updateCurrentTeam(authUser.userId, team.id);
    await this.userRepo.upsertUserRefreshToken(
      authUser.userId,
      token.refreshToken,
    );
    return ApiResponseDto.success(token);
  }
}
