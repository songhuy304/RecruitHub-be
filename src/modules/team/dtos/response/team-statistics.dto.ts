import { ApiProperty } from '@nestjs/swagger';

export class TeamStatisticsDTO {
  @ApiProperty({ type: 'number' })
  members: number;
  @ApiProperty({ type: 'number' })
  invites: number;
  @ApiProperty({ type: 'number' })
  joinRequests: number;
}
