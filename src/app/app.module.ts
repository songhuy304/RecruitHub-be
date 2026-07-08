import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/app/health.controller';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TeamModule } from '@/modules/team/team.module';
import { WebsocketModule } from '@/modules/websocket/websocket.module';
import { NotificationModule } from '@/modules/notifications/notification.module';

@Module({
  imports: [TerminusModule, CommonModule, AuthModule, TeamModule, WebsocketModule, NotificationModule],
  controllers: [HealthController],
})
export class AppModule { }
