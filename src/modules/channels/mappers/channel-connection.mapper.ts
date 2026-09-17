import { ChannelConnectionEntity } from '@/common/database/entities';
import { plainToInstance } from 'class-transformer';
import { ChannelConnectionResponseDto } from '../dtos/responses/channel.response.dto';

export class ChannelConnectionMapper {
  static toResponse(
    connection: ChannelConnectionEntity,
  ): ChannelConnectionResponseDto {
    return plainToInstance(
      ChannelConnectionResponseDto,
      {
        id: connection.id,
        platform: connection.platform,
        connected: connection.connected,
        displayName: connection.displayName,
        email: connection.email,
        avatarUrl: connection.avatarUrl,
        externalId: connection.externalId,
        connectedAt: connection.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }

  static toList(
    connections: ChannelConnectionEntity[],
  ): ChannelConnectionResponseDto[] {
    return connections.map((connection) => this.toResponse(connection));
  }
}
