export enum NotificationType {
    NEW_NOTIFICATION = "NEW_NOTIFICATION",
}

export interface NotificationPayload<T> {
    type: NotificationType;
    data: T;
}