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

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  FREELANCE = 'FREELANCE',
}

export enum JobLevel {
  INTERN = 'INTERN',
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

@Entity('jobs')
export class JobEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  requirements: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  benefits: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
  })
  employmentType: EmploymentType;

  @Column({
    type: 'enum',
    enum: JobLevel,
  })
  level: JobLevel;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMin: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salaryMax: number;

  @Column({
    nullable: true,
  })
  expiresAt: Date;

  @Column({
    nullable: true,
  })
  openedAt: Date;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @Column()
  location: string;

  @Column({
    type: 'text',
    array: true,
  })
  departments: string[];

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createdBy' })
  createdBy: UserEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: 'teamId' })
  team: TeamEntity;
}
