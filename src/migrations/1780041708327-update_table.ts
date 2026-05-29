import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1780041708327 implements MigrationInterface {
    name = 'UpdateTable1780041708327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "logoUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "slug"`);
    }

}
