import {
  DeepPartial,
  FindOneOptions,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  Repository as TypeOrmRepository,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { QueryOptions } from '@/common/helper/services/helper.query.service';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IPaginationParams } from '@/common/request/interfaces';
import { PaginatedDto } from '@/common/response';
import { Entity } from './entity';

export abstract class BaseRepository<TEntity extends Entity> {
  constructor(
    protected readonly repo: TypeOrmRepository<TEntity>,
    protected readonly helperQuery: HelperQueryService,
  ) {}

  get repository(): TypeOrmRepository<TEntity> {
    return this.repo;
  }

  async create(data: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity as TEntity);
  }

  async findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
    return this.repo.findOne(options);
  }

  async findOneBy(where: FindOptionsWhere<TEntity>): Promise<TEntity | null> {
    return this.repo.findOneBy(where);
  }

  async update(id: number, data: DeepPartial<TEntity>): Promise<TEntity> {
    const result = await this.repo.update(
      id,
      data as QueryDeepPartialEntity<TEntity>,
    );

    if (!result.affected) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    const entity = await this.findOneBy({ id } as FindOptionsWhere<TEntity>);

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    return entity;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(where: FindOptionsWhere<TEntity>): Promise<boolean> {
    return this.repo.exists({ where });
  }

  async findAll(
    params: IPaginationParams,
    query?: QueryOptions<TEntity>,
  ): Promise<PaginatedDto<TEntity>> {
    return this.helperQuery.findMany(this.repo, {
      ...query,
      pagination: {
        page: params.page,
        limit: params.limit,
      },
    });
  }
}
