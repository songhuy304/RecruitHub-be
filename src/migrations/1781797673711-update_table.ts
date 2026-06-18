import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1781797673711 implements MigrationInterface {
    name = 'UpdateTable1781797673711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "currentTeamId" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentTeamId"`);
    }

}
