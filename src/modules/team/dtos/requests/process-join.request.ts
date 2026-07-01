import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ProcessJoinRequestDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    teamId: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    id: number;
}

export class ApproveJoinRequestDto extends ProcessJoinRequestDto { }
export class RejectJoinRequestDto extends ProcessJoinRequestDto { }