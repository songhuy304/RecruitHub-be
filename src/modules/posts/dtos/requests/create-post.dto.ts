import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { EPostPrivacy } from '../../enums/post-privacy.enum';

export class CreatePostDto {
  @ApiProperty({ example: 'Hiring backend engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Apply now at recruithub' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: 'https://cdn.example.com/video.mp4' })
  @IsUrl()
  mediaUrl: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumb.jpg' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: ['hiring', 'backend'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    enum: EPostPrivacy,
    example: EPostPrivacy.PRIVATE,
  })
  @IsEnum(EPostPrivacy)
  @IsOptional()
  privacy?: EPostPrivacy;

  @ApiProperty({ example: [1, 2], type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  channelIds: number[];

  @ApiPropertyOptional({ example: '2026-09-18T10:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledAt?: Date;
}
