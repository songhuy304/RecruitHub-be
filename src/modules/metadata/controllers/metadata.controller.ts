import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetadataService } from '../services/metadata.service';
import { ApiResponseDto } from '@/common/response';
import { LocationResponseDto } from '../dtos';
import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { PublicRoute } from '@/common/guard/decorator';

@PublicRoute()
@ApiTags('Common')
@Controller('common')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('locations')
  @ApiEndpoint({
    summary: 'Get all locations ',
    serialization: [LocationResponseDto],
    httpStatus: HttpStatus.OK,
    isArray: true,
    messageKey: '',
  })
  async getAllLocations(): Promise<ApiResponseDto<LocationResponseDto[]>> {
    return this.metadataService.getAllLocations();
  }
}
