import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from '@/common/entities/team.entity';
import { TeamRepositoryImpl } from './repositories/team.repository';
import { TeamService } from './services/team.service';
import { HelperModule } from '@/common/helper/helper.module';
import { UserModule } from '../users/user.module';
import { TeamController } from './controller/team.controller';
import { TeamRequestEntity, TeamMemberEntity } from '@/common/entities';
import { TeamRequestRepository } from './repositories/team-request.repository';
import { TeamRequestService } from './services/team-request.service';
import { TeamMemberRepository } from './repositories/team-member.repository';
import { TeamPermissionService } from './services/team-permission.service';
import { NotificationModule } from '../notifications/notification.module';
import { TeamMailService } from './services/team-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, TeamRequestEntity, TeamMemberEntity]),
    HelperModule,
    UserModule,
    NotificationModule
  ],
  controllers: [TeamController],
  providers: [
    TeamRepositoryImpl,
    TeamRequestRepository,
    TeamMemberRepository,
    TeamService,
    TeamRequestService,
    TeamPermissionService,
    TeamMailService
  ],
  exports: [TeamRepositoryImpl, TeamMemberRepository, TeamService, TeamPermissionService],
})
export class TeamModule { }
