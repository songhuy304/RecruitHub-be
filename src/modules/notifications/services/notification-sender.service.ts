import { NotificationGateway } from "@/modules/websocket/gateways/notification.gateway";
import { Injectable, Logger } from "@nestjs/common";
import { NotificationPayload } from "../interfaces";
import { NOTIFICATION_EVENT } from "../constants";

@Injectable()
export class NotificationSenderService {
    private readonly logger = new Logger(NotificationSenderService.name);
    constructor(private readonly gateway: NotificationGateway) {
    }

    async sendToUser<T>(
        userId: number,
        payload: NotificationPayload<T>,
    ) {
        try {
            this.gateway.emitToUser(userId, NOTIFICATION_EVENT, payload);
        } catch (error) {
            this.logger.error(error)
        }
    }
}