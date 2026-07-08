import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { WebsocketModule } from '../websocket/websocket.module';
import { NotificationSenderService } from './services/notification-sender.service';
import { NotificationService } from './services/notification.service';

@Module({
    imports: [HelperModule, WebsocketModule],
    providers: [NotificationSenderService, NotificationService],
    exports: [NotificationSenderService, NotificationService],
})
export class NotificationModule { }