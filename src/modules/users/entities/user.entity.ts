import { BaseEntity } from '@/common/entities/base.entity';
import { EAuthProvider, ERole } from '@/common/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
    default: ERole.USER,
  })
  role: ERole;

  @Column({ type: 'enum', enum: EAuthProvider, default: EAuthProvider.LOCAL })
  provider: EAuthProvider;
}
