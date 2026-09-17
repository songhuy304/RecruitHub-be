import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EPostJob, POST_QUEUE } from '../constants/queue.constant';
import { PublishTargetJob } from '../interfaces/channel-publisher.interface';
import { PostPublisherService } from '../services/post-publisher.service';

@Processor(POST_QUEUE, { lockDuration: 10 * 60 * 1000 })
export class PostConsumer extends WorkerHost {
  private readonly logger = new Logger(PostConsumer.name);

  constructor(private readonly postPublisherService: PostPublisherService) {
    super();
  }

  async process(job: Job<PublishTargetJob>): Promise<void> {
    if (job.name !== EPostJob.PUBLISH_TARGET) {
      return;
    }

    this.logger.log(`Publishing post target ${job.data.targetId}`);
    await this.postPublisherService.publishTarget(job.data.targetId);
  }
}
