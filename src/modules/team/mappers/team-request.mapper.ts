import { Mapper } from '@/common/core';
import { TeamRequestEntity } from '@/common/entities';
import { plainToInstance } from 'class-transformer';
import { TeamJoinRequestDto } from '../dtos/response';

export class TeamRequestMapper extends Mapper<
  TeamRequestEntity,
  TeamJoinRequestDto
> {
  static mapFrom(request: TeamRequestEntity): TeamJoinRequestDto {
    const dto = plainToInstance(TeamJoinRequestDto, request.user || {}, {
      excludeExtraneousValues: true,
    });

    dto.id = request.id;
    dto.createdAt = request.createdAt;
    dto.updatedAt = request.updatedAt;


    return dto;
  }
}
