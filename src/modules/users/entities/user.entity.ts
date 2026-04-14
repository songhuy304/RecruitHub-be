import { BaseEntity } from '@/common/entities/base.entity';
import { ERole } from '@/common/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({
    type: 'enum',
    enum: ERole,
    default: ERole.USER,
  })
  role: ERole;
}
