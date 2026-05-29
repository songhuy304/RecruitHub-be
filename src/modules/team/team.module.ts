import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from '@/common/entities/team.entity';
import { TeamRepositoryImpl } from './repositories/team.repository';
import { TeamService } from './services/team.service';
import { HelperModule } from '@/common/helper/helper.module';
import { UserModule } from '../users/user.module';
import { TeamController } from './controller/team.controller';
import { TeamRequestEntity } from '@/common/entities';
import { TeamRequestRepository } from './repositories/team-request.repository';
import { TeamRequestService } from './services/team-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, TeamRequestEntity]),
    HelperModule,
    UserModule,
  ],
  controllers: [TeamController],
  providers: [
    TeamRepositoryImpl,
    TeamRequestRepository,
    TeamService,
    TeamRequestService,
  ],
  exports: [TeamRepositoryImpl, TeamService],
})
export class TeamModule {}
