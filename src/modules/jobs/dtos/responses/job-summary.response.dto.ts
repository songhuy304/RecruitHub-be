import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class JobSummaryResponseDto {
  @ApiProperty({ example: 10 })
  @Expose()
  @IsNumber()
  total: number;

  @ApiProperty({ example: 5 })
  @Expose()
  @IsNumber()
  open: number;

  @ApiProperty({ example: 3 })
  @Expose()
  @IsNumber()
  closed: number;

  @ApiProperty({ example: 2 })
  @Expose()
  @IsNumber()
  draft: number;

  @ApiProperty({ example: 2 })
  @Expose()
  @IsNumber()
  achieved: number;
}
