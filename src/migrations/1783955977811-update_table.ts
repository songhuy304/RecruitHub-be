import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1783955977811 implements MigrationInterface {
    name = 'UpdateTable1783955977811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."team_members_role_enum" RENAME TO "team_members_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."team_members_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" TYPE "public"."team_members_role_enum" USING "role"::"text"::"public"."team_members_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."team_members_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."team_members_role_enum_old" AS ENUM('OWNER', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" TYPE "public"."team_members_role_enum_old" USING "role"::"text"::"public"."team_members_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."team_members_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."team_members_role_enum_old" RENAME TO "team_members_role_enum"`);
    }

}
