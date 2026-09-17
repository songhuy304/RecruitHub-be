import { ChannelConnectionEntity } from '@/common/database/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository as TypeOrmRepository } from 'typeorm';
import { EChannelPlatform } from '../enums/channel-platform.enum';
import { IChannelConnectionRepository } from '../interfaces/channel-connection.repository.interface';

@Injectable()
export class ChannelConnectionRepositoryImpl extends IChannelConnectionRepository {
  constructor(
    @InjectRepository(ChannelConnectionEntity)
    repo: TypeOrmRepository<ChannelConnectionEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async findByUserId(userId: number): Promise<ChannelConnectionEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserAndId(
    userId: number,
    id: number,
  ): Promise<ChannelConnectionEntity | null> {
    return this.repo.findOne({ where: { userId, id } });
  }

  async findByUserAndIds(
    userId: number,
    ids: number[],
  ): Promise<ChannelConnectionEntity[]> {
    if (!ids.length) {
      return [];
    }

    return this.repo.find({
      where: { userId, id: In(ids) },
    });
  }

  async findByPlatformAndExternalId(
    platform: EChannelPlatform,
    externalId: string,
  ): Promise<ChannelConnectionEntity | null> {
    return this.repo.findOne({ where: { platform, externalId } });
  }
}
