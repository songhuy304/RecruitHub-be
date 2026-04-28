import { FindOptionsWhere } from 'typeorm';
import { QueryOptions } from '../helper/services/helper.query.service';
import { IPaginationParams } from '../request/interfaces';
import { PaginatedDto } from '../response';
import { Entity } from './entity';

export abstract class Repository<TEntity extends Entity> {
  abstract create(data: Partial<TEntity>): Promise<TEntity>;
  abstract findAll(
    params: IPaginationParams,
    query?: QueryOptions<TEntity>,
  ): Promise<PaginatedDto<TEntity>>;
  abstract findOne(filter: FindOptionsWhere<TEntity>): Promise<TEntity | null>;
  abstract update(id: number, data: Partial<TEntity>): Promise<TEntity>;
  abstract remove(id: number): Promise<void>;
}
