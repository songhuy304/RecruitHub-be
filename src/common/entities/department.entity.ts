import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ default: true })
  isActive: boolean;
}
