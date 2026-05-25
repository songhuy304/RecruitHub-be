import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { TeamEntity } from './team.entity';
import { ETeamRequestStatus } from '@/common/enums';

@Entity('team_requests')
export class TeamRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ETeamRequestStatus,
    default: ETeamRequestStatus.PENDING,
  })
  status: ETeamRequestStatus;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => TeamEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;
}
