import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

export type ChannelConnectionMetadata = {
  googleId?: string;
  channelId?: string;
  unionId?: string;
  username?: string;
  partnerId?: string;
  merchantId?: number;
  region?: string;
};

@Entity('channel_connections')
@Unique(['platform', 'externalId'])
@Index(['userId'])
export class ChannelConnectionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: EChannelPlatform })
  platform: EChannelPlatform;

  @Column()
  externalId: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string;

  @Column()
  tokenExpiresAt: Date;

  @Column({ type: 'text', nullable: true })
  scope?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: ChannelConnectionMetadata;

  @Column({ default: true })
  connected: boolean;

  @ManyToOne(() => UserEntity, (user) => user.channelConnections, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
