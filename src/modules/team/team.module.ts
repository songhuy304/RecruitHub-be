import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from '@/common/entities/team.entity';
import { TeamRepositoryImpl } from './repositories/team.repository';
import { TeamService } from './services/team.service';
import { HelperModule } from '@/common/helper/helper.module';
import { UserModule } from '../users/user.module';
import { TeamController } from './controller/team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity]), HelperModule, UserModule],
  controllers: [TeamController],
  providers: [TeamRepositoryImpl, TeamService],
  exports: [TeamRepositoryImpl, TeamService],
})
export class TeamModule {}
