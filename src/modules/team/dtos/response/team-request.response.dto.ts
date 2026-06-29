import { ERole } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class TeamJoinRequestDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty({ example: 'john@gmail.com' })
    @Expose()
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'John Doe' })
    @Expose()
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'https://avatar.com/a.png', required: false })
    @Expose()
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({ enum: ERole, example: ERole.MEMBER })
    @Expose()
    @IsEnum(ERole)
    role: ERole;

    @ApiProperty({ example: true })
    @Expose()
    @IsBoolean()
    isVerified: boolean;

    @ApiProperty({ example: '2026-06-29T14:00:13.000Z' })
    @Expose()
    @IsDate()
    createdAt: Date;

    @ApiProperty({ example: '2026-06-29T14:00:13.000Z' })
    @Expose()
    @IsDate()
    updatedAt: Date;
}
