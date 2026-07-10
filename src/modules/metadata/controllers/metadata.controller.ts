import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Common')
@Controller('Common')
export class MetadataController {}
