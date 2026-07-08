import { ApiEndpoint } from "@/common/doc/decorators/doc.api-endpoint.decorator";
import { AuthUser } from "@/common/guard/decorator";
import { IAuthUser } from "@/common/request/interfaces";
import {
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Query
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NotificationRequestDto } from "../dtos/requests/notification.get";
import { NotificationResponseDto } from "../dtos/responses/notification.get.response";
import { NotificationService } from "../services/notification.service";

@ApiTags('Notifications')
@ApiBearerAuth('accessToken')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notiService: NotificationService) { }

    @Get()
    @ApiEndpoint({
        summary: '',
        serialization: [NotificationResponseDto],
        httpStatus: HttpStatus.OK,
        messageKey: '',
    })
    getNotifications(
        @Query() query: NotificationRequestDto,
        @AuthUser() user: IAuthUser,
    ) {
        return this.notiService.getNotifications(query, user);
    }

    @Get('unread-count')
    countUnread(@AuthUser() user: IAuthUser) {
        return this.notiService.countUnread(user);
    }

    @Patch(':id/mark-as-read')
    markAsRead(
        @Param('id') id: number,
        @AuthUser() user: IAuthUser
    ) {
        return this.notiService.markAsRead(id, user);
    }

    @Patch('mark-all-as-read')
    markAllAsRead(@AuthUser() user: IAuthUser) {
        return this.notiService.markAllAsRead(user);
    }

}