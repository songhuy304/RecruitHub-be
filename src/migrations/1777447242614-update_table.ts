import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1777447242614 implements MigrationInterface {
    name = 'UpdateTable1777447242614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "createdById" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "createdById"`);
    }

}
