import { ERROR_CHANNEL } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { ChannelOauthAdapter } from './channel-oauth.adapter';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import {
  ChannelOauthExtras,
  ChannelProfile,
  ChannelTokenResponse,
} from '../interfaces/channel-oauth.interface';

const SHOPEE_AUTH_PATH = '/api/v2/shop/auth_partner';
const SHOPEE_TOKEN_PATH = '/api/v2/auth/token/get';
const SHOPEE_REFRESH_PATH = '/api/v2/auth/access_token/get';
const SHOPEE_SHOP_INFO_PATH = '/api/v2/shop/get_shop_info';

interface ShopeeTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expire_in?: number;
  shop_id?: number;
  merchant_id?: number;
  error?: string;
  message?: string;
}

@Injectable()
export class ShopeeOauthAdapter extends ChannelOauthAdapter {
  readonly platform = EChannelPlatform.SHOPEE;
  private readonly logger = new Logger(ShopeeOauthAdapter.name);
  private readonly partnerId?: number;
  private readonly partnerKey?: string;
  private readonly redirectUrl?: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    const partnerId = this.configService.get<string>(
      'auth.shopeeOauth.partnerId',
    );
    this.partnerId = partnerId ? Number(partnerId) : undefined;
    this.partnerKey = this.configService.get<string>(
      'auth.shopeeOauth.partnerKey',
    );
    this.redirectUrl = this.configService.get<string>(
      'auth.shopeeOauth.connectRedirectUrl',
    );
    this.baseUrl =
      this.configService.get<string>('auth.shopeeOauth.baseUrl') ??
      'https://partner.shopeemobile.com';
  }

  buildAuthUrl(state: string): string {
    this.assertConfigured();

    const timestamp = this.timestamp();
    const sign = this.sign(SHOPEE_AUTH_PATH, timestamp);
    const redirect = new URL(this.redirectUrl as string);
    redirect.searchParams.set('state', state);

    const params = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      sign,
      redirect: redirect.toString(),
    });

    return `${this.baseUrl}${SHOPEE_AUTH_PATH}?${params.toString()}`;
  }

  async exchangeCode(
    code: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelTokenResponse> {
    this.assertConfigured();
    const shopId = this.parseShopId(extras?.shopId);

    const tokens = await this.requestToken(SHOPEE_TOKEN_PATH, {
      code,
      shop_id: shopId,
      partner_id: this.partnerId,
    });

    return this.toTokenResponse(tokens, shopId);
  }

  async refreshAccessToken(
    refreshToken: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelTokenResponse> {
    this.assertConfigured();
    const shopId = this.parseShopId(extras?.shopId);

    const tokens = await this.requestToken(SHOPEE_REFRESH_PATH, {
      refresh_token: refreshToken,
      shop_id: shopId,
      partner_id: this.partnerId,
    });

    return this.toTokenResponse(tokens, shopId);
  }

  async fetchProfile(
    accessToken: string,
    extras?: ChannelOauthExtras,
  ): Promise<ChannelProfile> {
    this.assertConfigured();
    const shopId = this.parseShopId(extras?.shopId);
    const timestamp = this.timestamp();
    const sign = this.sign(
      SHOPEE_SHOP_INFO_PATH,
      timestamp,
      accessToken,
      shopId,
    );
    const params = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      sign,
      access_token: accessToken,
      shop_id: String(shopId),
    });

    try {
      const response = await fetch(
        `${this.baseUrl}${SHOPEE_SHOP_INFO_PATH}?${params.toString()}`,
      );
      const data = (await response.json()) as {
        shop_name?: string;
        region?: string;
        error?: string;
        message?: string;
      };

      if (!response.ok || data.error) {
        this.logger.warn('Shopee shop info failed', data);
        return this.fallbackProfile(shopId, extras);
      }

      return {
        externalId: String(shopId),
        displayName: data.shop_name ?? `Shop ${shopId}`,
        metadata: {
          partnerId: String(this.partnerId),
          merchantId: extras?.merchantId,
          region: data.region,
        },
      };
    } catch (error) {
      this.logger.warn('Shopee shop info error', error);
      return this.fallbackProfile(shopId, extras);
    }
  }

  async revokeToken(): Promise<void> {
    return;
  }

  private async requestToken(
    path: string,
    body: Record<string, unknown>,
  ): Promise<ShopeeTokenResponse> {
    const timestamp = this.timestamp();
    const sign = this.sign(path, timestamp);
    const params = new URLSearchParams({
      partner_id: String(this.partnerId),
      timestamp: String(timestamp),
      sign,
    });

    const response = await fetch(
      `${this.baseUrl}${path}?${params.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    const tokens = (await response.json()) as ShopeeTokenResponse;

    if (!response.ok || !tokens.access_token) {
      this.logger.error('Shopee token request failed', tokens);
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    return tokens;
  }

  private toTokenResponse(
    tokens: ShopeeTokenResponse,
    shopId: number,
  ): ChannelTokenResponse {
    return {
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expire_in ?? 14400,
      shopId: String(tokens.shop_id ?? shopId),
      merchantId: tokens.merchant_id,
    };
  }

  private fallbackProfile(
    shopId: number,
    extras?: ChannelOauthExtras,
  ): ChannelProfile {
    return {
      externalId: String(shopId),
      displayName: `Shop ${shopId}`,
      metadata: {
        partnerId: String(this.partnerId),
        merchantId: extras?.merchantId,
      },
    };
  }

  private sign(
    path: string,
    timestamp: number,
    accessToken?: string,
    shopId?: number,
  ): string {
    let base = `${this.partnerId}${path}${timestamp}`;
    if (accessToken) {
      base += accessToken;
    }
    if (shopId != null) {
      base += String(shopId);
    }

    return createHmac('sha256', this.partnerKey as string)
      .update(base)
      .digest('hex');
  }

  private parseShopId(shopId?: string): number {
    const parsed = Number(shopId);
    if (!shopId || Number.isNaN(parsed)) {
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }
    return parsed;
  }

  private timestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  private assertConfigured(): void {
    if (!this.partnerId || !this.partnerKey || !this.redirectUrl) {
      throw new BadRequestException(ERROR_CHANNEL.NOT_CONFIGURED);
    }
  }
}
