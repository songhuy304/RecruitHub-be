import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Command, CommandRunner } from 'nest-commander';
import locations from '../../data/dvhc.json';
import { LocationEntity } from '@/common/entities/location.entity';

@Injectable()
@Command({
  name: 'seed:locations',
})
export class SeedLocationsCommand extends CommandRunner {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.locationRepo.clear();

    await this.locationRepo.insert(
      locations.map((item) => ({
        code: item.code,
        name: item.name,
        englishName: item.englishName,
        administrativeLevel: item.administrativeLevel,
      })),
    );

    console.log(`Seeded ${locations.length} locations`);
  }
}
