import { BaseRepository } from '@/common/core';
import { ChannelConnectionEntity } from '@/common/database/entities';
import { EChannelPlatform } from '../enums/channel-platform.enum';

export abstract class IChannelConnectionRepository extends BaseRepository<ChannelConnectionEntity> {
  abstract findByUserId(userId: number): Promise<ChannelConnectionEntity[]>;
  abstract findByUserAndId(
    userId: number,
    id: number,
  ): Promise<ChannelConnectionEntity | null>;
  abstract findByPlatformAndExternalId(
    platform: EChannelPlatform,
    externalId: string,
  ): Promise<ChannelConnectionEntity | null>;
}
