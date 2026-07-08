import { NotificationGateway } from "@/modules/websocket/gateways/notification.gateway";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    constructor(private readonly gateway: NotificationGateway) { }
}