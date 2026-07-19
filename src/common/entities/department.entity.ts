import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { JobEntity } from './job.entity';

@Entity('departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => JobEntity, (job) => job.department)
  jobs: JobEntity[];
}
