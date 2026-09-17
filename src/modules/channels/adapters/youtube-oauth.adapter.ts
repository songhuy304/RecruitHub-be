import { ERROR_CHANNEL } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ChannelOauthAdapter } from './channel-oauth.adapter';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import {
  ChannelProfile,
  ChannelTokenResponse,
} from '../interfaces/channel-oauth.interface';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';
const YOUTUBE_OAUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/youtube.readonly',
];

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface YoutubeChannelListResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      thumbnails?: {
        default?: { url?: string };
        high?: { url?: string };
      };
    };
  }>;
}

@Injectable()
export class YoutubeOauthAdapter extends ChannelOauthAdapter {
  readonly platform = EChannelPlatform.YOUTUBE;
  private readonly logger = new Logger(YoutubeOauthAdapter.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.clientId = this.configService.getOrThrow<string>(
      'auth.googleOauth.clientId',
    );
    this.clientSecret = this.configService.getOrThrow<string>(
      'auth.googleOauth.secret',
    );
    this.redirectUrl = this.configService.getOrThrow<string>(
      'auth.googleOauth.connectRedirectUrl',
    );
  }

  buildAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUrl,
      response_type: 'code',
      scope: YOUTUBE_OAUTH_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<ChannelTokenResponse> {
    const tokens = await this.requestToken({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUrl,
      grant_type: 'authorization_code',
    });

    return this.toTokenResponse(tokens);
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<ChannelTokenResponse> {
    const tokens = await this.requestToken({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return this.toTokenResponse(tokens);
  }

  async fetchProfile(accessToken: string): Promise<ChannelProfile> {
    const googleUser = await this.getUserInfo(accessToken);

    if (!googleUser.sub || !googleUser.email) {
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    const channel = await this.getPrimaryChannel(accessToken);

    return {
      externalId: googleUser.sub,
      displayName: channel.title ?? googleUser.name ?? googleUser.email,
      email: googleUser.email,
      avatarUrl: channel.thumbnail ?? googleUser.picture,
      metadata: {
        googleId: googleUser.sub,
        channelId: channel.channelId,
      },
    };
  }

  async revokeToken(token: string): Promise<void> {
    try {
      await axios.post(GOOGLE_REVOKE_URL, new URLSearchParams({ token }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch (error) {
      this.logger.warn('Google token revoke failed', this.toLogPayload(error));
    }
  }

  private async requestToken(
    payload: Record<string, string>,
  ): Promise<GoogleTokenResponse> {
    try {
      const { data } = await axios.post<GoogleTokenResponse>(
        GOOGLE_TOKEN_URL,
        new URLSearchParams(payload),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      return data;
    } catch (error) {
      this.logger.error(
        'Google token request failed',
        this.toLogPayload(error),
      );
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const { data } = await axios.get<GoogleUserInfo>(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return data;
    } catch (error) {
      this.logger.error('Google userinfo failed', this.toLogPayload(error));
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }
  }

  private async getPrimaryChannel(accessToken: string): Promise<{
    channelId?: string;
    title?: string;
    thumbnail?: string;
  }> {
    try {
      const { data } = await axios.get<YoutubeChannelListResponse>(
        YOUTUBE_CHANNELS_URL,
        {
          params: { part: 'snippet', mine: true },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const channel = data.items?.[0];

      if (!channel) {
        return {};
      }

      return {
        channelId: channel.id,
        title: channel.snippet?.title,
        thumbnail:
          channel.snippet?.thumbnails?.high?.url ??
          channel.snippet?.thumbnails?.default?.url,
      };
    } catch (error) {
      this.logger.warn(
        'YouTube channel fetch failed',
        this.toLogPayload(error),
      );
      return {};
    }
  }

  private toTokenResponse(tokens: GoogleTokenResponse): ChannelTokenResponse {
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
    };
  }

  private toLogPayload(error: unknown): unknown {
    if (axios.isAxiosError(error)) {
      return error.response?.data ?? error.message;
    }
    return error;
  }
}
