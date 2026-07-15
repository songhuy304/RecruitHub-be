import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1784110929854 implements MigrationInterface {
    name = 'UpdateTable1784110929854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."jobs_status_enum" RENAME TO "jobs_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" TYPE "public"."jobs_status_enum" USING "status"::"text"::"public"."jobs_status_enum"`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum_old" AS ENUM('DRAFT', 'OPEN', 'ON_HOLD', 'CLOSED', 'ARCHIVED')`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" TYPE "public"."jobs_status_enum_old" USING "status"::"text"::"public"."jobs_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."jobs_status_enum_old" RENAME TO "jobs_status_enum"`);
    }

}
