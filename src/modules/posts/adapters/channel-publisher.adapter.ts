import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import {
  ChannelPublishPayload,
  ChannelPublishResult,
} from '../interfaces/channel-publisher.interface';

export const CHANNEL_PUBLISHERS = 'CHANNEL_PUBLISHERS';

export abstract class ChannelPublisherAdapter {
  abstract readonly platform: EChannelPlatform;
  readonly supported: boolean = true;

  abstract publish(
    accessToken: string,
    payload: ChannelPublishPayload,
  ): Promise<ChannelPublishResult>;
}
