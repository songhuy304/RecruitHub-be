import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository as TypeOrmRepository } from 'typeorm';
import { CompanyEntity } from '@/common/entities/company.entity';
import { ICompanyRepository } from '../interfaces/company.repository.interface';

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repo: TypeOrmRepository<CompanyEntity>,
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
}
