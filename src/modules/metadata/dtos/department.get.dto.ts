import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DepartmentResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;
}
