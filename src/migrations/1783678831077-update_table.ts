import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1783678831077 implements MigrationInterface {
    name = 'UpdateTable1783678831077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "departments" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "departments" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "teamId" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_44b548b5666511f79b31b5a020b" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_fe6a018cc1531ba11a16b5fb4c3" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_fe6a018cc1531ba11a16b5fb4c3"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_44b548b5666511f79b31b5a020b"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "teamId"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "departments"`);
        await queryRunner.query(`DROP TABLE "departments"`);
    }

}
