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
import { TeamRequestEntity, UserEntity, TeamMemberEntity } from '@/common/entities';
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
  ): Promise<ApiResponseDto<TeamResponseDto[]>> {
    const members = await this.dataSource.getRepository(TeamMemberEntity).find({
      where: { userId: authUser.userId },
      relations: ['team', 'team.members', 'team.members.user'],
    });

    const teams = members.map((m) => m.team).filter(Boolean);

    return ApiResponseDto.success(TeamMapper.toResponseList(teams));
  }

  async createTeam(
    payload: CreateTeamDto,
    authUser: IAuthUser,
  ): Promise<ApiGenericResponseDto> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const team = await manager.save(TeamEntity, {
          ...payload,
          createdById: authUser.userId,
          inviteCode: generateCode(6),
        });

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
    payload: IAuthUser,
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

      const member = await this.dataSource.getRepository(TeamMemberEntity).findOneBy({
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

      const member = await this.dataSource.getRepository(TeamMemberEntity).findOneBy({
        userId,
        teamId,
      });

      if (!member) {
        throw new BadRequestException(ERROR_TEAM.NOT_IN_TEAM);
      }

      await this.dataSource.getRepository(TeamMemberEntity).delete(member.id);

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

  // async inviteMember(dto: InviteMembersDto, authUser: IAuthUser) {}
}
