import { ERROR_POST } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { EChannelPlatform } from '@/modules/channels/enums/channel-platform.enum';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createReadStream } from 'node:fs';
import { ChannelPublisherAdapter } from './channel-publisher.adapter';
import { EPostPrivacy } from '../enums/post-privacy.enum';
import {
  ChannelPublishPayload,
  ChannelPublishResult,
  DownloadedMedia,
} from '../interfaces/channel-publisher.interface';
import { MediaFileService } from '../services/media-file.service';
import { toPublisherError } from '../utils/publisher-error.util';

const TIKTOK_CREATOR_INFO_URL =
  'https://open.tiktokapis.com/v2/post/publish/creator_info/query/';
const TIKTOK_VIDEO_INIT_URL =
  'https://open.tiktokapis.com/v2/post/publish/video/init/';
const TIKTOK_STATUS_URL =
  'https://open.tiktokapis.com/v2/post/publish/status/fetch/';
const TIKTOK_CAPTION_MAX = 2200;
const TIKTOK_MAX_CHUNK_BYTES = 64 * 1024 * 1024;
const TIKTOK_CHUNK_BYTES = 10 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

interface TikTokApiResponse<T> {
  data?: T;
  error?: { code?: string; message?: string };
}

interface TikTokCreatorInfo {
  privacy_level_options?: string[];
}

interface TikTokInitData {
  publish_id?: string;
  upload_url?: string;
}

interface TikTokStatusData {
  status?: string;
  fail_reason?: string;
}

@Injectable()
export class TiktokPublisherAdapter extends ChannelPublisherAdapter {
  readonly platform = EChannelPlatform.TIKTOK;
  private readonly logger = new Logger(TiktokPublisherAdapter.name);

  constructor(private readonly mediaFileService: MediaFileService) {
    super();
  }

  async publish(
    accessToken: string,
    payload: ChannelPublishPayload,
  ): Promise<ChannelPublishResult> {
    return this.mediaFileService.withFile(payload.mediaUrl, (file) =>
      this.uploadVideo(accessToken, payload, file),
    );
  }

  private async uploadVideo(
    accessToken: string,
    payload: ChannelPublishPayload,
    file: DownloadedMedia,
  ): Promise<ChannelPublishResult> {
    try {
      const privacyLevel = await this.resolvePrivacy(
        accessToken,
        payload.privacy,
      );
      const { chunkSize, totalChunkCount } = this.toChunkPlan(file.size);
      const init = await axios.post<TikTokApiResponse<TikTokInitData>>(
        TIKTOK_VIDEO_INIT_URL,
        {
          post_info: {
            title: this.toCaption(payload),
            privacy_level: privacyLevel,
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: file.size,
            chunk_size: chunkSize,
            total_chunk_count: totalChunkCount,
          },
        },
        {
          headers: this.authHeaders(accessToken),
          timeout: UPLOAD_TIMEOUT_MS,
        },
      );

      this.assertTikTokOk(init.data);
      const publishId = init.data.data?.publish_id;
      const uploadUrl = init.data.data?.upload_url;
      if (!publishId || !uploadUrl) {
        throw new BadRequestException(ERROR_POST.PUBLISH_FAILED);
      }

      await this.uploadChunks(uploadUrl, file, chunkSize);
      await this.waitUntilProcessed(accessToken, publishId);

      return {
        externalPostId: publishId,
        externalUrl: `https://www.tiktok.com/`,
      };
    } catch (error) {
      this.logger.error('TikTok publish failed', toPublisherError(error));
      throw new BadRequestException(toPublisherError(error));
    }
  }

  private async resolvePrivacy(
    accessToken: string,
    privacy: EPostPrivacy,
  ): Promise<string> {
    const requested =
      privacy === EPostPrivacy.PUBLIC
        ? 'PUBLIC_TO_EVERYONE'
        : 'SELF_ONLY';

    try {
      const { data } = await axios.post<TikTokApiResponse<TikTokCreatorInfo>>(
        TIKTOK_CREATOR_INFO_URL,
        {},
        { headers: this.authHeaders(accessToken) },
      );
      const options = data.data?.privacy_level_options ?? [];
      if (options.includes(requested)) {
        return requested;
      }
      if (options.includes('SELF_ONLY')) {
        return 'SELF_ONLY';
      }
      if (options[0]) {
        return options[0];
      }
    } catch (error) {
      this.logger.warn(
        'TikTok creator info failed, fallback to SELF_ONLY',
        toPublisherError(error),
      );
    }

    return 'SELF_ONLY';
  }

  private toChunkPlan(size: number): {
    chunkSize: number;
    totalChunkCount: number;
  } {
    if (size <= TIKTOK_MAX_CHUNK_BYTES) {
      return { chunkSize: size, totalChunkCount: 1 };
    }

    const chunkSize = TIKTOK_CHUNK_BYTES;
    return {
      chunkSize,
      totalChunkCount: Math.ceil(size / chunkSize),
    };
  }

  private async uploadChunks(
    uploadUrl: string,
    file: DownloadedMedia,
    chunkSize: number,
  ): Promise<void> {
    let start = 0;

    while (start < file.size) {
      const remaining = file.size - start;
      const currentSize = Math.min(chunkSize, remaining);
      const end = start + currentSize - 1;
      const stream = createReadStream(file.path, { start, end });

      await axios.put(uploadUrl, stream, {
        headers: {
          'Content-Type': file.contentType,
          'Content-Length': String(currentSize),
          'Content-Range': `bytes ${start}-${end}/${file.size}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: UPLOAD_TIMEOUT_MS,
      });

      start = end + 1;
    }
  }

  private async waitUntilProcessed(
    accessToken: string,
    publishId: string,
  ): Promise<void> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const { data } = await axios.post<TikTokApiResponse<TikTokStatusData>>(
        TIKTOK_STATUS_URL,
        { publish_id: publishId },
        { headers: this.authHeaders(accessToken) },
      );
      const status = data.data?.status;
      if (status === 'PUBLISH_COMPLETE' || status === 'PROCESSING') {
        return;
      }
      if (status === 'FAILED') {
        throw new BadRequestException(
          data.data?.fail_reason || ERROR_POST.PUBLISH_FAILED,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  private toCaption(payload: ChannelPublishPayload): string {
    const caption = payload.description
      ? `${payload.title}\n\n${payload.description}`
      : payload.title;
    return caption.slice(0, TIKTOK_CAPTION_MAX);
  }

  private authHeaders(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    };
  }

  private assertTikTokOk(response: TikTokApiResponse<unknown>): void {
    if (response.error?.code && response.error.code !== 'ok') {
      throw new BadRequestException(
        response.error.message || ERROR_POST.PUBLISH_FAILED,
      );
    }
  }
}
