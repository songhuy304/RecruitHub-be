import { ETeamRole } from "@/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class UpdateTeamMemberDto {
    @ApiProperty({
        enum: ETeamRole,
        example: ETeamRole.OWNER,
    })
    @IsEnum(ETeamRole)
    role: ETeamRole;
}