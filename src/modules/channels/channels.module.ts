import { CacheModule } from '@/common/cache/cache.module';
import { ChannelConnectionEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHANNEL_OAUTH_ADAPTERS } from './adapters/channel-oauth.adapter';
import { ShopeeOauthAdapter } from './adapters/shopee-oauth.adapter';
import { TiktokOauthAdapter } from './adapters/tiktok-oauth.adapter';
import { YoutubeOauthAdapter } from './adapters/youtube-oauth.adapter';
import { ChannelsController } from './controllers/channels.controller';
import { ChannelConnectionRepositoryImpl } from './repositories/channel-connection.repository';
import { ChannelService } from './services/channel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelConnectionEntity]),
    HelperModule,
    CacheModule,
  ],
  controllers: [ChannelsController],
  providers: [
    YoutubeOauthAdapter,
    TiktokOauthAdapter,
    ShopeeOauthAdapter,
    {
      provide: CHANNEL_OAUTH_ADAPTERS,
      useFactory: (
        youtube: YoutubeOauthAdapter,
        tiktok: TiktokOauthAdapter,
        shopee: ShopeeOauthAdapter,
      ) => [youtube, tiktok, shopee],
      inject: [YoutubeOauthAdapter, TiktokOauthAdapter, ShopeeOauthAdapter],
    },
    ChannelService,
    ChannelConnectionRepositoryImpl,
  ],
  exports: [ChannelService],
})
export class ChannelsModule {}
