import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1776055357287 implements MigrationInterface {
    name = 'UpdateTable1776055357287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
