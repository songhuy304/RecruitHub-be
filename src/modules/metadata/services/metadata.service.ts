import { Injectable, Logger } from '@nestjs/common';
import { LocationRepositoryImpl } from '../repositories/location.repository';
import { ApiResponseDto } from '@/common/response';
import { LocationResponseDto } from '../dtos';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  constructor(private readonly locationRepo: LocationRepositoryImpl) {}

  async getAllLocations(): Promise<ApiResponseDto<LocationResponseDto[]>> {
    const locations = await this.locationRepo.findAll();
    return ApiResponseDto.success(locations);
  }
}
