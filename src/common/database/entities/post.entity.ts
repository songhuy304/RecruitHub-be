import { EPostMediaType } from '@/modules/posts/enums/post-media-type.enum';
import { EPostPrivacy } from '@/modules/posts/enums/post-privacy.enum';
import { EPostStatus } from '@/modules/posts/enums/post-status.enum';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostTargetEntity } from './post-target.entity';
import { UserEntity } from './user.entity';

@Entity('posts')
@Index(['userId'])
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  mediaUrl: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({
    type: 'enum',
    enum: EPostPrivacy,
    default: EPostPrivacy.PRIVATE,
  })
  privacy: EPostPrivacy;

  @Column({
    type: 'enum',
    enum: EPostMediaType,
    default: EPostMediaType.VIDEO,
  })
  mediaType: EPostMediaType;

  @Column({ type: 'enum', enum: EPostStatus })
  status: EPostStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => PostTargetEntity, (target) => target.post, {
    cascade: true,
  })
  targets?: PostTargetEntity[];
}
