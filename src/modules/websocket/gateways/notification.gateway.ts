import { BaseGateway } from "@/common/core/base-gateway";
import { HelperEncryptionService } from "@/common/helper/services/helper.encryption.service";
import { IAuthUser } from "@/common/request/interfaces";
import { WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway extends BaseGateway {
    constructor(
        jwt: HelperEncryptionService,
    ) {
        super(jwt);
    }

    handleConnection(client: Socket) {
        super.handleConnection(client);
        const user = client.data.user as IAuthUser;
        client.join(`${user.userId}`);
    }


    emitToUser<T>(userId: number, event: string, data: T) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
}