import { ERROR_TEAM } from '@/common/constants';
import { TeamMemberEntity, TeamRequestEntity } from '@/common/entities';
import { TeamEntity } from '@/common/entities/team.entity';
import {
  ETeamRequestStatus,
  ETeamRole,
  ETeamType,
  SortOrder,
} from '@/common/enums';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@/common/filters/exception';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { IAuthUser } from '@/common/request/interfaces';
import {
  ApiGenericResponseDto,
  ApiResponseDto,
  PaginatedResponseDto,
} from '@/common/response';
import { generateCode } from '@/common/utils';
import { NotificationType } from '@/modules/notifications/interfaces';
import { NotificationProducer } from '@/modules/notifications/producers/notification.producer';
import { TeamMemberRepository } from '@/modules/team/repositories/team-member.repository';
import { UserRepositoryImpl } from '@/modules/users/repositories/user.repository';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import {
  CreateTeamDto,
  InviteMembersDto,
  UpdateTeamDto,
  UpdateTeamMemberDto,
} from '../dtos/requests';
import { TeamMembersDto } from '../dtos/requests/team-member.request';
import {
  TeamDetailDto,
  TeamMemberGetDto,
  TeamStatisticsDTO,
  TeamSwitchResponseDto,
} from '../dtos/response';
import { ITeamService } from '../interfaces/team.interface';
import { TeamMapper } from '../mappers';
import { TeamMemberMapper } from '../mappers/team-member.mapper';
import { TeamRequestRepository } from '../repositories/team-request.repository';
import { TeamRepositoryImpl } from '../repositories/team.repository';
import { TeamMailService } from './team-mail.service';

@Injectable()
export class TeamService implements ITeamService {
  private readonly logger = new Logger(TeamService.name);
  private LIMIT_TEAM = 5;

  constructor(
    private readonly teamRepo: TeamRepositoryImpl,
    private readonly userRepo: UserRepositoryImpl,
    private readonly teamRequestRepo: TeamRequestRepository,
    private readonly teamMemberRepo: TeamMemberRepository,
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly teamMailService: TeamMailService,
    private readonly senderService: NotificationProducer,
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
        members: {
          user: true,
        },
      },
    });

    if (!teams || teams.length === 0) {
      return ApiResponseDto.success([]);
    }

    return ApiResponseDto.success(
      TeamMapper.toResponseList(teams, authUser.userId),
    );
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

  async updateTeam(
    payload: UpdateTeamDto,
    teamId: number,
  ): Promise<ApiGenericResponseDto> {
    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    }

    await this.teamRepo.update(team.id, {
      ...payload,
    });

    return ApiGenericResponseDto.success();
  }

  async updateMemberRole(
    teamId: number,
    userId: number,
    payload: UpdateTeamMemberDto,
  ): Promise<ApiGenericResponseDto> {
    const user = await this.teamMemberRepo.findOneBy({ teamId, userId });
    if (!user) {
      throw new NotFoundException(ERROR_TEAM.NOT_IN_TEAM);
    }

    await this.teamMemberRepo.update(user.id, {
      role: payload.role,
    });

    return ApiGenericResponseDto.success();
  }

  async invitations(payload: InviteMembersDto): Promise<ApiGenericResponseDto> {
    const team = await this.teamRepo.findOneBy({ id: payload.teamId });
    if (!team) {
      throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    }

    const mails = [...new Set(payload.emails)];

    const users = await this.userRepo.repository.find({
      where: {
        email: In(mails),
      },
      select: { email: true, id: true, fullName: true },
    });

    for (const user of users) {
      await this.teamMailService.inviteMemberMail(
        user,
        team.name,
        team.inviteCode,
      );
    }

    return ApiGenericResponseDto.success();
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

      await this.senderService.send(
        {
          title: 'Member left team',
          content: `User ${authUser.userId} has left your team ${team.name}`,
          type: NotificationType.MEMBER_LEFT_TEAM,
          userId: team.createdById,
        },
        {
          teamId: team.id,
          userId: authUser.userId,
        },
      );

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

  async getTeamStatistics(
    teamId: number,
  ): Promise<ApiResponseDto<TeamStatisticsDTO>> {
    const team = await this.teamRepo.findOneBy({ id: teamId });

    if (!team) {
      throw new NotFoundException(ERROR_TEAM.NOT_FOUND);
    }

    const [membersCount, joinRequestsCount] = await Promise.all([
      this.teamMemberRepo.count({
        where: { teamId: team.id },
      }),
      this.teamRequestRepo.count({
        where: { team: { id: team.id }, status: ETeamRequestStatus.PENDING },
      }),
    ]);

    return ApiResponseDto.success({
      members: Number(membersCount ?? 0),
      joinRequests: Number(joinRequestsCount ?? 0),
      invites: 0,
    });
  }

  async getTeamMembers(
    query: TeamMembersDto,
  ): Promise<PaginatedResponseDto<TeamMemberGetDto>> {
    const { limit, page, search, teamId } = query;

    const members = await this.teamMemberRepo.findMany(
      { limit, page },
      {
        where: { teamId },
        filters: search
          ? {
              or: [
                { field: 'user.fullName', op: 'ilike', value: search },
                { field: 'user.email', op: 'ilike', value: search },
              ],
            }
          : undefined,
        relations: { user: true },
        sort: { createdAt: SortOrder.ASC },
      },
    );

    const dataMap = TeamMemberMapper.mapFromArray(members.data);
    return PaginatedResponseDto.success(dataMap, members.meta);
  }
}
