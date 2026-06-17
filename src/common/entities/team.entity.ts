import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { TeamMemberEntity } from '@/common/entities/team-member.entity';

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

  @OneToMany(() => TeamMemberEntity, (member) => member.team)
  members: TeamMemberEntity[];
}
