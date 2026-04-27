import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserEntity } from '@/common/entities/user.entity';

@Entity('companies')
export class CompanyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  inviteCode: string;

  @OneToMany(() => UserEntity, (user) => user.company)
  users: UserEntity[];
}
