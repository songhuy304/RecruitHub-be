import { EPostPrivacy } from '../enums/post-privacy.enum';

export interface ChannelPublishPayload {
  title: string;
  description?: string;
  mediaUrl: string;
  tags?: string[];
  privacy: EPostPrivacy;
}

export interface ChannelPublishResult {
  externalPostId: string;
  externalUrl?: string;
}

export interface DownloadedMedia {
  path: string;
  size: number;
  contentType: string;
}

export interface PublishTargetJob {
  targetId: number;
}
