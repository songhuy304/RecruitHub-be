import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1777448705670 implements MigrationInterface {
    name = 'UpdateTable1777448705670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_teamrole_enum" AS ENUM('OWNER', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "teamRole" "public"."users_teamrole_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "teamRole"`);
        await queryRunner.query(`DROP TYPE "public"."users_teamrole_enum"`);
    }

}
