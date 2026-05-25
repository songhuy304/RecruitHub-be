import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1779700378057 implements MigrationInterface {
    name = 'UpdateTable1779700378057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."team_requests_status_enum" RENAME TO "team_requests_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."team_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" TYPE "public"."team_requests_status_enum" USING "status"::"text"::"public"."team_requests_status_enum"`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."team_requests_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."team_requests_status_enum_old" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" TYPE "public"."team_requests_status_enum_old" USING "status"::"text"::"public"."team_requests_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "team_requests" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."team_requests_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."team_requests_status_enum_old" RENAME TO "team_requests_status_enum"`);
    }

}
