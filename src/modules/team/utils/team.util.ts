import { TeamEntity } from '@/common/entities';
import { ETeamRole } from '@/common/enums';

export const getTeamRoleByUser = (
    team: TeamEntity,
    userId: number,
): ETeamRole | undefined => {
    return team.members?.find((m) => m.userId === userId)?.role;
};