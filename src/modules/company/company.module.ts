import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '@/common/entities/company.entity';
import { CompanyRepositoryImpl } from './repositories/company.repository';
import { CompanyService } from './services/company.service';
import { HelperModule } from '@/common/helper/helper.module';
import { UserModule } from '../users/user.module';
import { CompanyController } from './controller/company.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity]),
    HelperModule,
    UserModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyRepositoryImpl, CompanyService],
  exports: [CompanyRepositoryImpl, CompanyService],
})
export class CompanyModule {}
