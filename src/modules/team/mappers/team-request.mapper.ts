import { TeamRequestEntity } from '@/common/entities';
import { plainToInstance } from 'class-transformer';
import { TeamRequestResponseDto } from '../dtos/response';
import { Mapper } from '@/common/core';

export class TeamRequestMapper extends Mapper<
  TeamRequestEntity,
  TeamRequestResponseDto
> {
  static mapFrom(request: TeamRequestEntity): TeamRequestResponseDto {
    return plainToInstance(TeamRequestResponseDto, request, {
      excludeExtraneousValues: true,
    });
  }
}
