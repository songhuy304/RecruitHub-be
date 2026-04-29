import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { UserEntity } from '@/common/entities/user.entity';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IUserRepository } from '../interfaces/user.repository.interface';

@Injectable()
export class UserRepositoryImpl extends IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    repo: TypeOrmRepository<UserEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async findByEmailOrUsername(userName: string): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: [{ userName }, { email: userName }],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOneBy({ email });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findOneBy({ id });
  }
}
