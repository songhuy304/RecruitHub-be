import { ERROR_POST } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import { Injectable } from '@nestjs/common';
import { ChannelPublisherAdapter } from './channel-publisher.adapter';
import {
  ChannelPublishPayload,
  ChannelPublishResult,
} from '../interfaces/channel-publisher.interface';

@Injectable()
export class ShopeePublisherAdapter extends ChannelPublisherAdapter {
  readonly platform = EChannelPlatform.SHOPEE;
  readonly supported = false;

  async publish(
    _accessToken: string,
    _payload: ChannelPublishPayload,
  ): Promise<ChannelPublishResult> {
    throw new BadRequestException(ERROR_POST.PLATFORM_UNSUPPORTED);
  }
}
