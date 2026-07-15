import configs from '@/common/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DepartmentEntity, LocationEntity } from '@/common/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/common/database/database.module';
import { SeedDepartmentsCommand } from './seeds/department.command';
import { SeedLocationsCommand } from './seeds/location.command';
import { SeedCommand } from './seeds/seed.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forFeature([LocationEntity, DepartmentEntity]),
    DatabaseModule,
  ],
  providers: [SeedCommand, SeedLocationsCommand, SeedDepartmentsCommand],
})
export class ScriptsModule {}
