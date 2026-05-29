import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { ETeamRequestStatus } from '@/common/enums';
import { UserResponseDto } from '@/modules/users/dtos/responses/user.response.dto';

export class TeamRequestResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({
    enum: ETeamRequestStatus,
  })
  @Expose()
  status: ETeamRequestStatus;

  @ApiProperty({
    type: () => UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
