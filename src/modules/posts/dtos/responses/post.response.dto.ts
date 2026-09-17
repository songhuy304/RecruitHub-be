import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import { EPostPrivacy } from '../../enums/post-privacy.enum';
import { EPostMediaType } from '../../enums/post-media-type.enum';
import {
  EPostStatus,
  EPostTargetStatus,
} from '../../enums/post-status.enum';

export class PostTargetResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ example: 3 })
  @Expose()
  @IsNumber()
  @IsOptional()
  channelId?: number;

  @ApiProperty({ enum: EChannelPlatform, example: EChannelPlatform.YOUTUBE })
  @Expose()
  @IsEnum(EChannelPlatform)
  platform: EChannelPlatform;

  @ApiPropertyOptional({ example: 'Huy Đăng' })
  @Expose()
  @IsString()
  @IsOptional()
  channelName?: string;

  @ApiPropertyOptional({ example: '@HuyDangzz' })
  @Expose()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ enum: EPostTargetStatus, example: EPostTargetStatus.PENDING })
  @Expose()
  @IsEnum(EPostTargetStatus)
  status: EPostTargetStatus;

  @ApiPropertyOptional({ example: 'abc123' })
  @Expose()
  @IsString()
  @IsOptional()
  externalPostId?: string;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=abc123' })
  @Expose()
  @IsString()
  @IsOptional()
  externalUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  publishedAt?: Date;
}

export class PostResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Hiring backend engineer' })
  @Expose()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://cdn.example.com/video.mp4' })
  @Expose()
  @IsString()
  mediaUrl: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: ['hiring'] })
  @Expose()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: EPostPrivacy, example: EPostPrivacy.PRIVATE })
  @Expose()
  @IsEnum(EPostPrivacy)
  privacy: EPostPrivacy;

  @ApiProperty({ enum: EPostMediaType, example: EPostMediaType.VIDEO })
  @Expose()
  @IsEnum(EPostMediaType)
  mediaType: EPostMediaType;

  @ApiProperty({ enum: EPostStatus, example: EPostStatus.PUBLISHING })
  @Expose()
  @IsEnum(EPostStatus)
  status: EPostStatus;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  scheduledAt?: Date;

  @ApiProperty({ type: [PostTargetResponseDto] })
  @Expose()
  @Type(() => PostTargetResponseDto)
  @ValidateNested({ each: true })
  targets: PostTargetResponseDto[];

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  createdAt?: Date;
}
