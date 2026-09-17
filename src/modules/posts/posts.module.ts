import { PostEntity, PostTargetEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { ChannelsModule } from '@/modules/channels/channels.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHANNEL_PUBLISHERS } from './adapters/channel-publisher.adapter';
import { ShopeePublisherAdapter } from './adapters/shopee-publisher.adapter';
import { TiktokPublisherAdapter } from './adapters/tiktok-publisher.adapter';
import { YoutubePublisherAdapter } from './adapters/youtube-publisher.adapter';
import { POST_QUEUE } from './constants/queue.constant';
import { PostsController } from './controllers/posts.controller';
import { PostConsumer } from './consumers/post.consumer';
import { PostProducer } from './producers/post.producer';
import { PostRepositoryImpl } from './repositories/post.repository';
import { PostTargetRepositoryImpl } from './repositories/post-target.repository';
import { MediaFileService } from './services/media-file.service';
import { PostPublisherService } from './services/post-publisher.service';
import { PostService } from './services/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, PostTargetEntity]),
    BullModule.registerQueue({
      name: POST_QUEUE,
    }),
    HelperModule,
    ChannelsModule,
  ],
  controllers: [PostsController],
  providers: [
    MediaFileService,
    YoutubePublisherAdapter,
    TiktokPublisherAdapter,
    ShopeePublisherAdapter,
    {
      provide: CHANNEL_PUBLISHERS,
      useFactory: (
        youtube: YoutubePublisherAdapter,
        tiktok: TiktokPublisherAdapter,
        shopee: ShopeePublisherAdapter,
      ) => [youtube, tiktok, shopee],
      inject: [
        YoutubePublisherAdapter,
        TiktokPublisherAdapter,
        ShopeePublisherAdapter,
      ],
    },
    PostRepositoryImpl,
    PostTargetRepositoryImpl,
    PostProducer,
    PostConsumer,
    PostPublisherService,
    PostService,
  ],
})
export class PostsModule {}
