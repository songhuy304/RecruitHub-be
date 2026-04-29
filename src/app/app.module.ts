import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/app/health.controller';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TeamModule } from '@/modules/team/team.module';

@Module({
  imports: [TerminusModule, CommonModule, AuthModule, TeamModule],
  controllers: [HealthController],
})
export class AppModule {}
