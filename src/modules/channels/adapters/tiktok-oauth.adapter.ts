import { ERROR_CHANNEL } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { ChannelOauthAdapter } from './channel-oauth.adapter';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import {
  ChannelOauthExtras,
  ChannelProfile,
  ChannelTokenResponse,
} from '../interfaces/channel-oauth.interface';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_REVOKE_URL = 'https://open.tiktokapis.com/v2/oauth/revoke/';
const TIKTOK_USERINFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_OAUTH_SCOPES = [
  'user.info.basic',
  'user.info.profile',
  'video.publish',
];
const TIKTOK_USER_FIELDS = [
  'open_id',
  'union_id',
  'avatar_url',
  'display_name',
  'username',
];

interface TikTokTokenResponse {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

@Injectable()
export class TiktokOauthAdapter extends ChannelOauthAdapter {
  readonly platform = EChannelPlatform.TIKTOK;
  private readonly logger = new Logger(TiktokOauthAdapter.name);
  private readonly clientKey?: string;
  private readonly clientSecret?: string;
  private readonly redirectUrl?: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.clientKey = this.configService.get<string>(
      'auth.tiktokOauth.clientKey',
    );
    this.clientSecret = this.configService.get<string>(
      'auth.tiktokOauth.secret',
    );
    this.redirectUrl = this.configService.get<string>(
      'auth.tiktokOauth.connectRedirectUrl',
    );
  }

  createConnectExtras(): ChannelOauthExtras {
    return { codeVerifier: randomBytes(32).toString('base64url') };
  }

  buildAuthUrl(state: string, extras?: ChannelOauthExtras): string {
    this.assertConfigured();

    if (!extras?.codeVerifier) {
      throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
    }

    const params = new URLSearchParams({
      client_key: this.clientKey as string,
      redirect_uri: this.redirectUrl as string,
      response_type: 'code',
      scope: TIKTOK_OAUTH_SCOPES.join(','),
      state,
      code_challenge: this.toCodeChallenge(extras.codeVerifier),
      code_challenge_method: 'S256',
    });

    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(
    code: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelTokenResponse> {
    this.assertConfigured();

    if (!extras?.codeVerifier) {
      throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
    }

    return this.requestToken({
      client_key: this.clientKey as string,
      client_secret: this.clientSecret as string,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUrl as string,
      code_verifier: extras.codeVerifier,
    });
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<ChannelTokenResponse> {
    this.assertConfigured();

    return this.requestToken({
      client_key: this.clientKey as string,
      client_secret: this.clientSecret as string,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  async fetchProfile(accessToken: string): Promise<ChannelProfile> {
    const params = new URLSearchParams({
      fields: TIKTOK_USER_FIELDS.join(','),
    });
    const response = await fetch(
      `${TIKTOK_USERINFO_URL}?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error('TikTok userinfo failed', errorBody);
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    const data = (await response.json()) as {
      data?: {
        user?: {
          open_id?: string;
          union_id?: string;
          avatar_url?: string;
          display_name?: string;
          username?: string;
        };
      };
      error?: { code?: string; message?: string };
    };

    const user = data.data?.user;
    if (!user?.open_id) {
      this.logger.error('TikTok userinfo missing open_id', data.error);
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    return {
      externalId: user.open_id,
      displayName: user.display_name ?? user.username ?? user.open_id,
      avatarUrl: user.avatar_url,
      metadata: {
        unionId: user.union_id,
        username: user.username,
      },
    };
  }

  async revokeToken(token: string): Promise<void> {
    if (!this.clientKey || !this.clientSecret) {
      return;
    }

    try {
      const body = new URLSearchParams({
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        token,
      });
      await fetch(TIKTOK_REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch (error) {
      this.logger.warn('TikTok token revoke failed', error);
    }
  }

  private async requestToken(
    payload: Record<string, string>,
  ): Promise<ChannelTokenResponse> {
    const response = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload),
    });

    const tokens = (await response.json()) as TikTokTokenResponse;

    if (!response.ok || !tokens.access_token) {
      this.logger.error('TikTok token request failed', tokens);
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in ?? 3600,
      scope: tokens.scope,
    };
  }

  private toCodeChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier).digest('base64url');
  }

  private assertConfigured(): void {
    if (!this.clientKey || !this.clientSecret || !this.redirectUrl) {
      throw new BadRequestException(ERROR_CHANNEL.NOT_CONFIGURED);
    }
  }
}
