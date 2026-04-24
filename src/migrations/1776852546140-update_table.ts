import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1776852546140 implements MigrationInterface {
    name = 'UpdateTable1776852546140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_provider_enum" RENAME TO "users_provider_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'google', 'facebook', 'github')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" TYPE "public"."users_provider_enum" USING "provider"::"text"::"public"."users_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'local'`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum_old" AS ENUM('local', 'google', 'facebook')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" TYPE "public"."users_provider_enum_old" USING "provider"::"text"::"public"."users_provider_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'local'`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_provider_enum_old" RENAME TO "users_provider_enum"`);
    }

}
