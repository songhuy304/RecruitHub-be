import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '@/common/entities/company.entity';
import { CompanyRepositoryImpl } from './repositories/company.repository';
import { CompanyService } from './services/company.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  providers: [CompanyRepositoryImpl, CompanyService],
  exports: [CompanyRepositoryImpl, CompanyService],
})
export class CompanyModule {}
