import { NotificationEntity } from './notification.entity';
import { TokenEntity } from './token.entity';
import { UserEntity } from './user.entity';

export * from './base.entity';
export * from './user.entity';
export * from './token.entity';
export * from './notification.entity';

export const ALL_ENTITIES = [UserEntity, TokenEntity, NotificationEntity];
