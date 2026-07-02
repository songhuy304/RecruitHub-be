import { ERROR_TEAM } from "@/common/constants";
import { ETeamRole } from "@/common/enums";
import { ForbiddenException } from "@/common/filters/exception";
import { Injectable } from "@nestjs/common";
import { TeamMemberRepository } from "../repositories/team-member.repository";

@Injectable()
export class TeamPermissionService {
    constructor(
        private readonly teamMemberRepo: TeamMemberRepository,
    ) { }

    async requireOwner(teamId: number, userId: number): Promise<void> {
        const teamRole = await this.teamMemberRepo.getRoleByUser(userId, teamId);

        if (teamRole !== ETeamRole.OWNER) {
            throw new ForbiddenException(ERROR_TEAM.OWNER_REQUIRED);
        }
    }
}