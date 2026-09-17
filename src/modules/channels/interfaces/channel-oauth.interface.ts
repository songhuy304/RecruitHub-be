import { EChannelPlatform } from '../enums/channel-platform.enum';

export interface ChannelOauthExtras {
  codeVerifier?: string;
  shopId?: string;
  merchantId?: number;
}

export interface ChannelTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
  shopId?: string;
  merchantId?: number;
}

export interface ChannelProfile {
  externalId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelConnectUrlResult {
  url: string;
  nonce: string;
}

export interface ChannelOauthState {
  userId: number;
  nonce: string;
  platform: EChannelPlatform;
}

export interface ChannelOauthCachePayload {
  userId: number;
  platform: EChannelPlatform;
  codeVerifier?: string;
}
