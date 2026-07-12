import { Module } from '@nestjs/common';
import { MetadataController } from './controllers/metadata.controller';
import { LocationRepositoryImpl } from './repositories/location.repository';
import { MetadataService } from './services/metadata.service';
import { LocationEntity } from '@/common/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from '@/common/helper/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity]), HelperModule],
  controllers: [MetadataController],
  providers: [LocationRepositoryImpl, MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
