import { ApiEndpoint } from '@/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser, PublicRoute } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import { ApiGenericResponseDto, ApiResponseDto } from '@/common/response';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  CHANNEL_OAUTH_COOKIE,
  CHANNEL_OAUTH_STATE_TTL_SECONDS,
} from '../constants/channel.constant';
import {
  ChannelConnectUrlDto,
  ChannelConnectionResponseDto,
} from '../dtos/responses/channel.response.dto';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import { ChannelService } from '../services/channel.service';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  @ApiBearerAuth('accessToken')
  @ApiEndpoint({
    summary: 'List connected channels',
    serialization: ChannelConnectionResponseDto,
    isArray: true,
    httpStatus: HttpStatus.OK,
    messageKey: 'channel.list.fetched',
  })
  async list(
    @AuthUser() authUser: IAuthUser,
  ): Promise<ApiResponseDto<ChannelConnectionResponseDto[]>> {
    return this.channelService.list(authUser.userId);
  }

  @Get('/:platform/connect')
  @ApiBearerAuth('accessToken')
  @ApiEndpoint({
    summary: 'Get OAuth URL to connect a channel',
    serialization: ChannelConnectUrlDto,
    httpStatus: HttpStatus.OK,
    messageKey: 'channel.connect.url',
  })
  async connect(
    @AuthUser() authUser: IAuthUser,
    @Param('platform', new ParseEnumPipe(EChannelPlatform))
    platform: EChannelPlatform,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponseDto<ChannelConnectUrlDto>> {
    const { url, nonce } = await this.channelService.createConnectUrl(
      authUser.userId,
      platform,
    );

    res.cookie(CHANNEL_OAUTH_COOKIE, nonce, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.APP_ENV !== 'local',
      maxAge: CHANNEL_OAUTH_STATE_TTL_SECONDS * 1000,
      path: '/',
    });

    return ApiResponseDto.success({ url });
  }

  @Get('/:platform/callback')
  @PublicRoute()
  async callback(
    @Param('platform', new ParseEnumPipe(EChannelPlatform))
    platform: EChannelPlatform,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('shop_id') shopId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (error) {
        const reason = error === 'access_denied' ? 'denied' : 'failed';
        return res.redirect(
          302,
          this.channelService.getFrontendRedirect(platform, 'error', reason),
        );
      }

      const cookieNonce = this.readCookie(req, CHANNEL_OAUTH_COOKIE);
      if (!code || (!state && !cookieNonce)) {
        return res.redirect(
          302,
          this.channelService.getFrontendRedirect(
            platform,
            'error',
            'invalid_state',
          ),
        );
      }

      const redirectUrl = await this.channelService.handleCallback(
        platform,
        code,
        state,
        cookieNonce,
        shopId,
      );

      res.clearCookie(CHANNEL_OAUTH_COOKIE, { path: '/' });
      return res.redirect(302, redirectUrl);
    } catch (callbackError) {
      res.clearCookie(CHANNEL_OAUTH_COOKIE, { path: '/' });
      const reason = this.toRedirectReason(callbackError);
      return res.redirect(
        302,
        this.channelService.getFrontendRedirect(platform, 'error', reason),
      );
    }
  }

  @Delete('/:id')
  @ApiBearerAuth('accessToken')
  @ApiEndpoint({
    summary: 'Disconnect a channel connection',
    httpStatus: HttpStatus.OK,
    messageKey: 'channel.disconnected',
  })
  async disconnect(
    @AuthUser() authUser: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiGenericResponseDto> {
    return this.channelService.disconnect(authUser.userId, id);
  }

  private readCookie(req: Request, name: string): string | undefined {
    const header = req.headers.cookie;
    if (!header) {
      return undefined;
    }

    const match = header
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`));

    if (!match) {
      return undefined;
    }

    return decodeURIComponent(match.slice(name.length + 1));
  }

  private toRedirectReason(error: unknown): string {
    const message =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message: string }).message)
        : '';

    if (message.includes('account-linked')) {
      return 'already_linked';
    }
    if (message.includes('state-invalid')) {
      return 'invalid_state';
    }
    return 'failed';
  }
}
