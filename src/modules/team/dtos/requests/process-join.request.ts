import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ProcessJoinRequestDto {
    @ApiProperty({
        type: Number,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    teamId: number;

    @ApiProperty({
        type: Number,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id: number;
}

export class ApproveJoinRequestDto extends ProcessJoinRequestDto { }
export class RejectJoinRequestDto extends ProcessJoinRequestDto { }