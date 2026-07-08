import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "../gateways/notification.gateway";
import { NOTIFICATION_EVENT } from "../constants";
import { NotificationPayload } from "../interfaces";

@Injectable()
export class NotificationService {
    constructor(
        private readonly gateway: NotificationGateway
    ) { }


    async sendNotification<T>(userId: number, data: NotificationPayload<T>) {
        this.gateway.server
            .to(userId.toString())
            .emit(NOTIFICATION_EVENT, data);
    }
}