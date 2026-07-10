import { MigrationInterface, QueryRunner } from "typeorm";

export class LocationTable1783673415312 implements MigrationInterface {
    name = 'LocationTable1783673415312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "locations" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "englishName" character varying NOT NULL, "administrativeLevel" character varying NOT NULL, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_employmenttype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_level_enum" AS ENUM('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('DRAFT', 'OPEN', 'ON_HOLD', 'CLOSED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "requirements" text, "benefits" text, "employmentType" "public"."jobs_employmenttype_enum" NOT NULL, "level" "public"."jobs_level_enum" NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'DRAFT', "salaryMin" numeric(12,2), "salaryMax" numeric(12,2), "expiresAt" TIMESTAMP, "openedAt" TIMESTAMP, "isPublished" boolean NOT NULL DEFAULT false, "isPinned" boolean NOT NULL DEFAULT false, "location" character varying NOT NULL, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_employmenttype_enum"`);
        await queryRunner.query(`DROP TABLE "locations"`);
    }

}
