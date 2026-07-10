import { JobEntity } from '@/common/entities/job.entity';
import { LocationEntity } from '@/common/entities/location.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity, LocationEntity])],
  controllers: [],
  providers: [],
  exports: [],
})
export class JobModule {}
