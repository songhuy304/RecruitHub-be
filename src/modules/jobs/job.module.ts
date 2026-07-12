import { JobEntity } from '@/common/entities/job.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobController } from './controllers/job.controller';
import { jobRepositoryImpl } from './repositories/job.repository';
import { JobService } from './services/job.service';
import { HelperModule } from '@/common/helper/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity]), HelperModule],
  controllers: [JobController],
  providers: [jobRepositoryImpl, JobService],
  exports: [JobService],
})
export class JobModule {}
