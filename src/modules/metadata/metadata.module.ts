import { Module } from '@nestjs/common';
import { MetadataController } from './controllers/metadata.controller';

@Module({
  imports: [],
  controllers: [MetadataController],
  providers: [],
  exports: [],
})
export class MetadataModule {}
