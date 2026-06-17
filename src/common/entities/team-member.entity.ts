import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { TeamEntity } from './team.entity';
import { ETeamRole } from '@/common/enums';

@Entity('team_members')
@Index(['userId', 'teamId'], { unique: true })
export class TeamMemberEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  teamId: number;

  @ManyToOne(
    () => UserEntity,
    (user) => user.teamMembers,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(
    () => TeamEntity,
    (team) => team.members,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;

  @Column({
    type: 'enum',
    enum: ETeamRole,
  })
  role: ETeamRole;
}
