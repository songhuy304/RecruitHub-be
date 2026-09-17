import { EChannelPlatform } from '../enums/channel-platform.enum';
import {
  ChannelOauthExtras,
  ChannelProfile,
  ChannelTokenResponse,
} from '../interfaces/channel-oauth.interface';

export const CHANNEL_OAUTH_ADAPTERS = 'CHANNEL_OAUTH_ADAPTERS';

export abstract class ChannelOauthAdapter {
  abstract readonly platform: EChannelPlatform;

  createConnectExtras(): ChannelOauthExtras {
    return {};
  }

  abstract buildAuthUrl(state: string, extras?: ChannelOauthExtras): string;

  abstract exchangeCode(
    code: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelTokenResponse>;

  abstract refreshAccessToken(
    refreshToken: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelTokenResponse>;

  abstract fetchProfile(
    accessToken: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelProfile>;

  abstract revokeToken(token: string): Promise<void>;
}
