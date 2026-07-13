import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1783955925504 implements MigrationInterface {
    name = 'UpdateTable1783955925504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "currency" character varying(3) NOT NULL DEFAULT 'VND'`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "isNegotiable" boolean`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "officeAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "skills" text array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_worklocationtype_enum" AS ENUM('AT_OFFICE', 'REMOTE', 'HYBRID')`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "workLocationType" "public"."jobs_worklocationtype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "viewCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "isUrgent" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "isUrgent"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "viewCount"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "workLocationType"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_worklocationtype_enum"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "skills"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "officeAddress"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "isNegotiable"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "currency"`);
    }

}
