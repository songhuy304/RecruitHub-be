import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { WebsocketModule } from '../websocket/websocket.module';
import { NotificationSenderService } from './services/notification-sender.service';
import { NotificationService } from './services/notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/common/entities/notification.entity';
import { NotificationRepositoryImpl } from './repositories/notification.repository';
import { NotificationController } from './controllers/notification.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([NotificationEntity]),
        HelperModule,
        WebsocketModule

    ],
    controllers: [NotificationController],
    providers: [NotificationSenderService, NotificationService, NotificationRepositoryImpl],
    exports: [NotificationSenderService, NotificationService],
})
export class NotificationModule { }