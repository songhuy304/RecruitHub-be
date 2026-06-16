import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TeamEntity } from './team.entity';
import { TokenEntity } from './token.entity';
import { EAuthProvider, ERole, ETeamRole } from '@/common/enums';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userName: string;

  @Column({ unique: true })
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
    default: ERole.OWNER,
  })
  role: ERole;

  @Column({ type: 'enum', enum: ETeamRole, nullable: true })
  teamRole: ETeamRole | null;

  @Column({ type: 'enum', enum: EAuthProvider, default: EAuthProvider.LOCAL })
  provider: EAuthProvider;

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => TeamEntity, (team) => team.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];
}
