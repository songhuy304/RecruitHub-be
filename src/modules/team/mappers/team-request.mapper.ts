import { TeamRequestEntity } from '@/common/entities';
import { plainToInstance } from 'class-transformer';
import { TeamRequestResponseDto } from '../dtos/response';
import { Mapper } from '@/common/core';
import { UserMapper } from '@/modules/users/mappers/user.mapper';

export class TeamRequestMapper extends Mapper<
  TeamRequestEntity,
  TeamRequestResponseDto
> {
  static mapFrom(request: TeamRequestEntity): TeamRequestResponseDto {
    const dto = plainToInstance(TeamRequestResponseDto, request, {
      excludeExtraneousValues: true,
    });
    if (request.user) {
      dto.user = UserMapper.toResponse(request.user);
    }
    return dto;
  }
}
