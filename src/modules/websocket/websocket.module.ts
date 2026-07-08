import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationService } from './services/notification.service';

@Module({
    imports: [HelperModule],
    providers: [NotificationGateway, NotificationService],
    exports: [NotificationService],
})
export class WebsocketModule { }