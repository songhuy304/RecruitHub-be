import { JobEntity } from './job.entity';
import { LocationEntity } from './location.entity';
import { NotificationEntity } from './notification.entity';
import { TeamMemberEntity } from './team-member.entity';
import { TeamRequestEntity } from './team-request.entity';
import { TeamEntity } from './team.entity';
import { TokenEntity } from './token.entity';
import { UserEntity } from './user.entity';

export * from './base.entity';
export * from './team-request.entity';
export * from './user.entity';
export * from './token.entity';
export * from './team.entity';
export * from './team-member.entity';
export * from './job.entity';
export * from './location.entity';
export * from './notification.entity';

export const ALL_ENTITIES = [
  TeamRequestEntity,
  UserEntity,
  JobEntity,
  LocationEntity,
  TokenEntity,
  TeamEntity,
  TeamMemberEntity,
  NotificationEntity,
];
