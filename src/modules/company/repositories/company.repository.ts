import { CompanyEntity } from '@/common/entities/company.entity';
import {
  HelperQueryService,
  QueryOptions,
} from '@/common/helper/services/helper.query.service';
import { IPaginationParams } from '@/common/request/interfaces';
import { PaginatedDto } from '@/common/response';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { ICompanyRepository } from '../interfaces/company.repository.interface';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: TypeOrmRepository<CompanyEntity>,
    private readonly helperQuery: HelperQueryService,
  ) {}

  async findOne(
    filter: FindOptionsWhere<CompanyEntity>,
  ): Promise<CompanyEntity | null> {
    return this.repo.findOneBy(filter);
  }

  async create(data: Partial<CompanyEntity>): Promise<CompanyEntity> {
    const company = this.repo.create(data);
    return this.repo.save(company);
  }

  async update(
    id: number,
    data: Partial<CompanyEntity>,
  ): Promise<CompanyEntity> {
    const result = await this.repo.update(id, data);

    if (!result.affected) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    const company = await this.findOne({ id });

    // This guard ensures a non-null return for repository contract.
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    return company;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findAll(
    params: IPaginationParams,
    query?: QueryOptions<CompanyEntity>,
  ): Promise<PaginatedDto<CompanyEntity>> {
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
