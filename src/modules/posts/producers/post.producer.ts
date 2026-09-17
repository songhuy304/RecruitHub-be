import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { EPostJob, POST_QUEUE } from '../constants/queue.constant';
import { PublishTargetJob } from '../interfaces/channel-publisher.interface';

@Injectable()
export class PostProducer {
  constructor(
    @InjectQueue(POST_QUEUE)
    private readonly queue: Queue<PublishTargetJob>,
  ) {}

  async enqueueTarget(targetId: number, delayMs = 0): Promise<void> {
    await this.queue.add(
      EPostJob.PUBLISH_TARGET,
      { targetId },
      {
        delay: delayMs > 0 ? delayMs : undefined,
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }
}
