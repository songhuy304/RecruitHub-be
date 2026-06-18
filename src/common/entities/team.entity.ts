import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { TeamMemberEntity } from '@/common/entities/team-member.entity';
import { ETeamType } from '../enums';

@Entity('teams')
export class TeamEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  inviteCode: string;

  @Column()
  createdById: number;

  @Column({
    type: 'enum',
    enum: ETeamType,
    default: ETeamType.PERSONAL,
  })
  type: ETeamType;

  @OneToMany(() => TeamMemberEntity, (member) => member.team, {
    cascade: ['insert'],
  })
  members: TeamMemberEntity[];
}
