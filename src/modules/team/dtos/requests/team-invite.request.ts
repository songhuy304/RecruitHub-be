import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

export class InviteMembersDto {
  @ApiProperty({
    type: [String],
    example: ['a@gmail.com', 'b@gmail.com'],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
