import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/app/health.controller';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { WebsocketModule } from '@/modules/websocket/websocket.module';
import { NotificationModule } from '@/modules/notifications/notification.module';

@Module({
  imports: [
    TerminusModule,
    CommonModule,
    AuthModule,
    WebsocketModule,
    NotificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
