import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { UserEntity } from '@/common/entities/user.entity';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { IPaginationParams } from '@/common/request/interfaces';
import { PaginatedDto } from '@/common/response';
import {
  HelperQueryService,
  QueryOptions,
} from '@/common/helper/services/helper.query.service';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: TypeOrmRepository<UserEntity>,
    private readonly helperQuery: HelperQueryService,
  ) {}

  async findOne(
    filter: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return await this.repo.findOneBy(filter);
  }

  create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    await this.repo.update(id, data);
    return this.findOne({ id });
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
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

  async findAll(
    params: IPaginationParams,
    query?: QueryOptions<UserEntity>,
  ): Promise<PaginatedDto<UserEntity>> {
    return this.helperQuery.findMany(this.repo, {
      ...query,
      pagination: {
        page: params.page,
        limit: params.limit,
      },
      where: query?.where,
      relations: query?.relations,
      select: query?.select,
    });
  }
}
