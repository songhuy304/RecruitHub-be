import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LocationResponseDto {
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
  englishName: string;

  @ApiProperty()
  @Expose()
  administrativeLevel: string;
}
