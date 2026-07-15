import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, CommandRunner } from 'nest-commander';
import { Repository } from 'typeorm';

import departments from '../../data/departments.json';
import { DepartmentEntity } from '@/common/entities/department.entity';

@Injectable()
@Command({
  name: 'seed:departments',
})
export class SeedDepartmentsCommand extends CommandRunner {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.departmentRepo.clear();

    await this.departmentRepo.insert(
      departments.map((item) => ({
        code: item.code,
        name: item.name,
        slug: item.code,
        isActive: true,
      })),
    );

    console.log(`Seeded ${departments.length} departments`);
  }
}
