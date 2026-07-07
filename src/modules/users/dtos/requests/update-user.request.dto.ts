import { REGEX_PASSWORD } from "@/common/constants";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({ example: 'https://avatar.com/a.png', required: false })
    @IsString()
    @IsOptional()
    avatar?: string;
}

export class ChangePasswordDto {
    @ApiProperty({
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(REGEX_PASSWORD)
    public password: string;
}