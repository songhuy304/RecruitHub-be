import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNumber } from 'class-validator';

export class InviteMembersDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  teamId: number;

  @ApiProperty({
    type: [String],
    required: true,
    example: ['a@gmail.com', 'b@gmail.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
