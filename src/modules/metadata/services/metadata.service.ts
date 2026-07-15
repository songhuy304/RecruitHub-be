import { Injectable, Logger } from '@nestjs/common';
import { LocationRepositoryImpl } from '../repositories/location.repository';
import { ApiResponseDto } from '@/common/response';
import { DepartmentResponseDto, LocationResponseDto } from '../dtos';
import { DepartmentRepositoryImpl } from '../repositories/department.repository';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  constructor(
    private readonly locationRepo: LocationRepositoryImpl,
    private readonly departmentRepo: DepartmentRepositoryImpl,
  ) {}

  async getAllLocations(): Promise<ApiResponseDto<LocationResponseDto[]>> {
    const locations = await this.locationRepo.findAll();
    return ApiResponseDto.success(locations);
  }

  async getAllDepartments(): Promise<ApiResponseDto<DepartmentResponseDto[]>> {
    const departments = await this.departmentRepo.findAll({
      filters: { and: [{ field: 'isActive', op: 'eq', value: true }] },
    });
    return ApiResponseDto.success(departments);
  }
}
