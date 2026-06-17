import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1781669823634 implements MigrationInterface {
    name = 'UpdateTable1781669823634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TYPE "public"."tokens_type_enum" RENAME TO "tokens_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tokens_type_enum" AS ENUM('refresh_token', 'verification', 'forgot_password')`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "public"."tokens_type_enum" USING "type"::"text"::"public"."tokens_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tokens_type_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a49a58e5fe52d7f5458a0863ae" ON "users" ("email", "provider") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a49a58e5fe52d7f5458a0863ae"`);
        await queryRunner.query(`CREATE TYPE "public"."tokens_type_enum_old" AS ENUM('refresh_token', 'verification', 'password_reset')`);
        await queryRunner.query(`ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "public"."tokens_type_enum_old" USING "type"::"text"::"public"."tokens_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tokens_type_enum_old" RENAME TO "tokens_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

}
