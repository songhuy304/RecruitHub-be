import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { NotificationEntity } from './notification.entity';
import { TokenEntity } from './token.entity';
import { ChannelConnectionEntity } from './channel-connection.entity';
import { PostEntity } from './post.entity';
import { ERole } from '../../guard/constants/role.constant';
import { EAuthProvider } from '@/modules/auth/enums/provider.enum';

@Entity('users')
@Index(['email', 'provider'], { unique: true })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  fullName: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.ADMIN,
  })
  role: ERole;

  @Column({ type: 'enum', enum: EAuthProvider, default: EAuthProvider.LOCAL })
  provider: EAuthProvider;

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => ChannelConnectionEntity, (connection) => connection.user)
  channelConnections?: ChannelConnectionEntity[];

  @OneToMany(() => PostEntity, (post) => post.user)
  posts?: PostEntity[];
}
