import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1782289501467 implements MigrationInterface {
    name = 'UpdateTable1782289501467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "userName"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('ADMIN', 'MEMBER', 'OWNER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'OWNER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "userName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59" UNIQUE ("userName")`);
    }

}
