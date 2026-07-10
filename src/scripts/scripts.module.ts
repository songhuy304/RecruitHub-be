import configs from '@/common/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LocationEntity } from '@/common/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/common/database/database.module';
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
    TypeOrmModule.forFeature([LocationEntity]),
    DatabaseModule,
  ],
  providers: [SeedCommand, SeedLocationsCommand],
})
export class ScriptsModule {}
