import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import { EPostTargetStatus } from '@/modules/posts/enums/post-status.enum';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ChannelConnectionEntity } from './channel-connection.entity';
import { PostEntity } from './post.entity';

@Entity('post_targets')
@Unique(['postId', 'channelConnectionId'])
@Index(['postId'])
export class PostTargetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column({ nullable: true })
  channelConnectionId?: number;

  @Column({ type: 'enum', enum: EChannelPlatform })
  platform: EChannelPlatform;

  @Column({
    type: 'enum',
    enum: EPostTargetStatus,
    default: EPostTargetStatus.PENDING,
  })
  status: EPostTargetStatus;

  @Column({ nullable: true })
  externalPostId?: string;

  @Column({ nullable: true })
  externalUrl?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => PostEntity, (post) => post.targets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => ChannelConnectionEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'channelConnectionId' })
  channelConnection?: ChannelConnectionEntity;
}
