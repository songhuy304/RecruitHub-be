import { Module } from '@nestjs/common';
import { MetadataController } from './controllers/metadata.controller';
import { LocationRepositoryImpl } from './repositories/location.repository';
import { MetadataService } from './services/metadata.service';
import { DepartmentEntity, LocationEntity } from '@/common/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from '@/common/helper/helper.module';
import { DepartmentRepositoryImpl } from './repositories/department.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity, DepartmentEntity]),
    HelperModule,
  ],
  controllers: [MetadataController],
  providers: [
    LocationRepositoryImpl,
    DepartmentRepositoryImpl,
    MetadataService,
  ],
  exports: [MetadataService, LocationRepositoryImpl, DepartmentRepositoryImpl],
})
export class MetadataModule {}
