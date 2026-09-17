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

const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';
const YOUTUBE_TITLE_MAX = 100;
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

interface YoutubeVideoResponse {
  id?: string;
}

@Injectable()
export class YoutubePublisherAdapter extends ChannelPublisherAdapter {
  readonly platform = EChannelPlatform.YOUTUBE;
  private readonly logger = new Logger(YoutubePublisherAdapter.name);

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
      const init = await axios.post(
        YOUTUBE_UPLOAD_URL,
        {
          snippet: {
            title: payload.title.slice(0, YOUTUBE_TITLE_MAX),
            description: payload.description ?? '',
            tags: payload.tags,
            categoryId: '22',
          },
          status: {
            privacyStatus: this.toPrivacy(payload.privacy),
            selfDeclaredMadeForKids: false,
          },
        },
        {
          params: { uploadType: 'resumable', part: 'snippet,status' },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Length': String(file.size),
            'X-Upload-Content-Type': file.contentType,
          },
          timeout: UPLOAD_TIMEOUT_MS,
        },
      );

      const uploadUrl = String(init.headers.location ?? '');
      if (!uploadUrl) {
        throw new BadRequestException(ERROR_POST.PUBLISH_FAILED);
      }

      const { data } = await axios.put<YoutubeVideoResponse>(
        uploadUrl,
        createReadStream(file.path),
        {
          headers: {
            'Content-Type': file.contentType,
            'Content-Length': String(file.size),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: UPLOAD_TIMEOUT_MS,
        },
      );

      if (!data.id) {
        throw new BadRequestException(ERROR_POST.PUBLISH_FAILED);
      }

      return {
        externalPostId: data.id,
        externalUrl: `https://www.youtube.com/watch?v=${data.id}`,
      };
    } catch (error) {
      this.logger.error('YouTube publish failed', toPublisherError(error));
      throw new BadRequestException(toPublisherError(error));
    }
  }

  private toPrivacy(privacy: EPostPrivacy): string {
    if (privacy === EPostPrivacy.PUBLIC) {
      return 'public';
    }
    if (privacy === EPostPrivacy.UNLISTED) {
      return 'unlisted';
    }
    return 'private';
  }
}
