import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '@/common/entities/company.entity';
import { CompanyRepositoryImpl } from './repositories/company.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [CompanyRepositoryImpl],
  exports: [CompanyRepositoryImpl],
})
export class CompanyModule {}
