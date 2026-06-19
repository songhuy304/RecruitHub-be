import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1781863087718 implements MigrationInterface {
    name = 'UpdateTable1781863087718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "currentTeamId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "currentTeamId" SET NOT NULL`);
    }

}
