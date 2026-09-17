import { ERROR_POST } from '@/common/constants';
import { BadRequestException } from '@/common/filters/exception';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import { DownloadedMedia } from '../interfaces/channel-publisher.interface';

const MAX_MEDIA_BYTES = 512 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 2 * 60 * 1000;

@Injectable()
export class MediaFileService {
  private readonly logger = new Logger(MediaFileService.name);

  async withFile<T>(
    url: string,
    handler: (file: DownloadedMedia) => Promise<T>,
  ): Promise<T> {
    const file = await this.download(url);
    try {
      return await handler(file);
    } finally {
      await this.cleanup(file.path);
    }
  }

  async download(url: string): Promise<DownloadedMedia> {
    const filePath = join(tmpdir(), `post-${randomUUID()}`);

    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxContentLength: MAX_MEDIA_BYTES,
        maxBodyLength: MAX_MEDIA_BYTES,
      });
      await pipeline(response.data, createWriteStream(filePath));

      const fileStat = await stat(filePath);
      if (fileStat.size <= 0) {
        throw new BadRequestException(ERROR_POST.MEDIA_FAILED);
      }
      const headerType = String(response.headers['content-type'] ?? '');
      const rawType = headerType.split(';')[0];
      const contentType = rawType.startsWith('video/') ? rawType : 'video/mp4';

      return {
        path: filePath,
        size: fileStat.size,
        contentType,
      };
    } catch (error) {
      await this.cleanup(filePath);
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Failed to download media', error);
      throw new BadRequestException(ERROR_POST.MEDIA_FAILED);
    }
  }

  async cleanup(filePath: string): Promise<void> {
    await unlink(filePath).catch(() => undefined);
  }
}
