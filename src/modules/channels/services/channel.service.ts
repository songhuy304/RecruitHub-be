import { CacheService } from '@/common/cache/services/cache.service';
import { ERROR_CHANNEL } from '@/common/constants';
import { redisKey } from '@/common/constants/redis.constant';
import {
  ChannelConnectionEntity,
  ChannelConnectionMetadata,
} from '@/common/database/entities';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';
import { IEncryptDataPayload } from '@/common/helper/interfaces/encryption.interface';
import { HelperEncryptionService } from '@/common/helper/services/helper.encryption.service';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import {
  CHANNEL_OAUTH_ADAPTERS,
  ChannelOauthAdapter,
} from '../adapters/channel-oauth.adapter';
import {
  CHANNEL_OAUTH_STATE_TTL_SECONDS,
  CHANNEL_TOKEN_REFRESH_SKEW_MS,
} from '../constants/channel.constant';
import { ChannelConnectionResponseDto } from '../dtos/responses/channel.response.dto';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import {
  ChannelConnectUrlResult,
  ChannelOauthCachePayload,
  ChannelOauthExtras,
  ChannelOauthState,
  ChannelProfile,
  ChannelTokenResponse,
} from '../interfaces/channel-oauth.interface';
import { ChannelConnectionMapper } from '../mappers/channel-connection.mapper';
import { ChannelConnectionRepositoryImpl } from '../repositories/channel-connection.repository';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly channelConnectionRepository: ChannelConnectionRepositoryImpl,
    @Inject(CHANNEL_OAUTH_ADAPTERS)
    private readonly adapters: ChannelOauthAdapter[],
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('app.frontend');
  }

  async createConnectUrl(
    userId: number,
    platform: EChannelPlatform,
  ): Promise<ChannelConnectUrlResult> {
    const adapter = this.getAdapter(platform);
    const nonce = randomUUID();
    const extras = adapter.createConnectExtras();
    const state =
      await this.helperEncryptionService.createToken<ChannelOauthState>(
        { userId, nonce, platform },
        { expiresIn: `${CHANNEL_OAUTH_STATE_TTL_SECONDS}s` },
      );

    const cachePayload: ChannelOauthCachePayload = {
      userId,
      platform,
      codeVerifier: extras.codeVerifier,
    };

    await this.cacheService.set(
      redisKey.channelOauth(nonce),
      cachePayload,
      CHANNEL_OAUTH_STATE_TTL_SECONDS,
    );

    return {
      url: adapter.buildAuthUrl(state, extras),
      nonce,
    };
  }

  getFrontendRedirect(
    platform: EChannelPlatform,
    status: 'success' | 'error',
    reason?: string,
  ): string {
    const url = new URL('/channels', this.frontendUrl);
    url.searchParams.set('platform', platform);
    url.searchParams.set('status', status);
    if (reason) {
      url.searchParams.set('reason', reason);
    }
    return url.toString();
  }

  async handleCallback(
    platform: EChannelPlatform,
    code: string,
    state: string | undefined,
    cookieNonce?: string,
    shopId?: string,
  ): Promise<string> {
    const payload = await this.verifyOauthState(state, cookieNonce, platform);
    const adapter = this.getAdapter(platform);
    const extras: ChannelOauthExtras = {
      codeVerifier: payload.codeVerifier,
      shopId,
    };
    const tokens = await adapter.exchangeCode(code, extras);
    extras.shopId = shopId ?? tokens.shopId;
    extras.merchantId = tokens.merchantId;

    const profile = await adapter.fetchProfile(tokens.accessToken, extras);
    await this.upsertConnection(payload.userId, platform, tokens, profile);

    return this.getFrontendRedirect(platform, 'success');
  }

  async list(
    userId: number,
  ): Promise<ApiResponseDto<ChannelConnectionResponseDto[]>> {
    const connections =
      await this.channelConnectionRepository.findByUserId(userId);
    return ApiResponseDto.success(ChannelConnectionMapper.toList(connections));
  }

  async disconnect(
    userId: number,
    connectionId: number,
  ): Promise<ApiGenericResponseDto> {
    const connection = await this.getOwnedConnection(userId, connectionId);

    if (connection.connected) {
      await this.revokeIfConnected(connection);
      await this.channelConnectionRepository.update(connection.id, {
        connected: false,
      });
    }

    return ApiGenericResponseDto.success('Disconnected channel');
  }

  async remove(
    userId: number,
    connectionId: number,
  ): Promise<ApiGenericResponseDto> {
    const connection = await this.getOwnedConnection(userId, connectionId);

    await this.revokeIfConnected(connection);
    await this.channelConnectionRepository.remove(connection.id);

    return ApiGenericResponseDto.success('Deleted channel');
  }

  async getValidAccessToken(connectionId: number): Promise<string> {
    const connection = await this.channelConnectionRepository.findOneBy({
      id: connectionId,
    });

    if (!connection || !connection.connected) {
      throw new NotFoundException(ERROR_CHANNEL.NOT_CONNECTED);
    }

    const stillValid =
      connection.tokenExpiresAt.getTime() - Date.now() >
      CHANNEL_TOKEN_REFRESH_SKEW_MS;

    if (stillValid) {
      return this.decryptToken(connection.accessToken);
    }

    if (!connection.refreshToken) {
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    const adapter = this.getAdapter(connection.platform);
    const refreshToken = await this.decryptToken(connection.refreshToken);
    const tokens = await adapter.refreshAccessToken(refreshToken, {
      shopId: connection.externalId,
    });
    const encryptedAccessToken = await this.encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken
      ? await this.encryptToken(tokens.refreshToken)
      : connection.refreshToken;

    await this.channelConnectionRepository.update(connection.id, {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: this.toExpiryDate(tokens.expiresIn),
      scope: tokens.scope ?? connection.scope,
    });

    return tokens.accessToken;
  }

  private async verifyOauthState(
    state: string | undefined,
    cookieNonce: string | undefined,
    platform: EChannelPlatform,
  ): Promise<ChannelOauthCachePayload & ChannelOauthState> {
    try {
      if (state) {
        const payload =
          await this.helperEncryptionService.verifyToken<ChannelOauthState>(
            state,
          );

        const userId = Number(payload?.userId);
        if (!userId || !payload?.nonce || payload.platform !== platform) {
          throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
        }

        if (cookieNonce && cookieNonce !== payload.nonce) {
          throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
        }

        const cached = await this.cacheService.get<ChannelOauthCachePayload>(
          redisKey.channelOauth(payload.nonce),
        );

        if (
          !cached ||
          Number(cached.userId) !== userId ||
          cached.platform !== platform
        ) {
          throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
        }

        await this.cacheService.del(redisKey.channelOauth(payload.nonce));
        return {
          userId,
          nonce: payload.nonce,
          platform,
          codeVerifier: cached.codeVerifier,
        };
      }

      if (cookieNonce) {
        const cached = await this.cacheService.get<ChannelOauthCachePayload>(
          redisKey.channelOauth(cookieNonce),
        );

        if (!cached || cached.platform !== platform || !cached.userId) {
          throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
        }

        await this.cacheService.del(redisKey.channelOauth(cookieNonce));
        return {
          userId: Number(cached.userId),
          nonce: cookieNonce,
          platform,
          codeVerifier: cached.codeVerifier,
        };
      }

      throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Invalid channel OAuth state', error);
      throw new BadRequestException(ERROR_CHANNEL.STATE_INVALID);
    }
  }

  private async upsertConnection(
    userId: number,
    platform: EChannelPlatform,
    tokens: ChannelTokenResponse,
    profile: ChannelProfile,
  ): Promise<ChannelConnectionEntity> {
    const existingByExternal =
      await this.channelConnectionRepository.findByPlatformAndExternalId(
        platform,
        profile.externalId,
      );

    if (existingByExternal && existingByExternal.userId !== userId) {
      throw new BadRequestException(ERROR_CHANNEL.ACCOUNT_LINKED);
    }

    if (!tokens.refreshToken && !existingByExternal?.refreshToken) {
      throw new BadRequestException(ERROR_CHANNEL.TOKEN_FAILED);
    }

    const encryptedAccessToken = await this.encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken
      ? await this.encryptToken(tokens.refreshToken)
      : existingByExternal?.refreshToken;
    const payload = {
      displayName: profile.displayName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      tokenExpiresAt: this.toExpiryDate(tokens.expiresIn),
      scope: tokens.scope,
      metadata: profile.metadata as ChannelConnectionMetadata | undefined,
      connected: true,
    };

    if (existingByExternal) {
      return this.channelConnectionRepository.update(
        existingByExternal.id,
        payload,
      );
    }

    return this.channelConnectionRepository.create({
      userId,
      platform,
      externalId: profile.externalId,
      ...payload,
    });
  }

  private async getOwnedConnection(
    userId: number,
    connectionId: number,
  ): Promise<ChannelConnectionEntity> {
    const connection = await this.channelConnectionRepository.findByUserAndId(
      userId,
      connectionId,
    );

    if (!connection) {
      throw new NotFoundException(ERROR_CHANNEL.NOT_CONNECTED);
    }

    return connection;
  }

  private async revokeIfConnected(
    connection: ChannelConnectionEntity,
  ): Promise<void> {
    if (!connection.connected) {
      return;
    }

    const adapter = this.getAdapter(connection.platform);
    const tokenToRevoke = connection.refreshToken ?? connection.accessToken;
    try {
      const decrypted = await this.decryptToken(tokenToRevoke);
      await adapter.revokeToken(decrypted);
    } catch (error) {
      this.logger.warn(
        `Failed to revoke token for connection ${connection.id}`,
        error,
      );
    }
  }

  private getAdapter(platform: EChannelPlatform): ChannelOauthAdapter {
    const adapter = this.adapters.find((item) => item.platform === platform);
    if (!adapter) {
      throw new BadRequestException(ERROR_CHANNEL.PLATFORM_UNSUPPORTED);
    }
    return adapter;
  }

  private toExpiryDate(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  private async encryptToken(token: string): Promise<string> {
    const encrypted = await this.helperEncryptionService.encrypt(token);
    return JSON.stringify(encrypted);
  }

  private async decryptToken(value: string): Promise<string> {
    const payload = JSON.parse(value) as IEncryptDataPayload;
    return this.helperEncryptionService.decrypt(payload);
  }
}
