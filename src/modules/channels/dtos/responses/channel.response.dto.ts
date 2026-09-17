import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EChannelPlatform } from '../../enums/channel-platform.enum';

export class ChannelConnectUrlDto {
  @ApiProperty({
    example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
  })
  @Expose()
  @IsString()
  url: string;
}

export class ChannelConnectionResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ enum: EChannelPlatform, example: EChannelPlatform.YOUTUBE })
  @Expose()
  @IsEnum(EChannelPlatform)
  platform: EChannelPlatform;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  connected: boolean;

  @ApiProperty({ example: 'My Channel' })
  @Expose()
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: 'channel@gmail.com' })
  @Expose()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://yt3.ggpht.com/...' })
  @Expose()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'UC1234567890' })
  @Expose()
  @IsString()
  externalId: string;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  connectedAt?: Date;
}
