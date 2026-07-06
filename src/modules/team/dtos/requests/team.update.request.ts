import { PartialType } from "@nestjs/swagger";
import { CreateTeamDto } from "./team.create.request";

// update-team.dto.ts
export class UpdateTeamDto extends PartialType(CreateTeamDto) {

}