import { NotificationEntity } from './notification.entity';
import { TokenEntity } from './token.entity';
import { UserEntity } from './user.entity';
import { ChannelConnectionEntity } from './channel-connection.entity';
import { PostEntity } from './post.entity';
import { PostTargetEntity } from './post-target.entity';

export * from './base.entity';
export * from './user.entity';
export * from './token.entity';
export * from './notification.entity';
export * from './channel-connection.entity';
export * from './post.entity';
export * from './post-target.entity';

export const ALL_ENTITIES = [
  UserEntity,
  TokenEntity,
  NotificationEntity,
  ChannelConnectionEntity,
  PostEntity,
  PostTargetEntity,
];
