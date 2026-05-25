import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1779695315858 implements MigrationInterface {
    name = 'UpdateTable1779695315858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."team_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "team_requests" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "status" "public"."team_requests_status_enum" NOT NULL DEFAULT 'pending', "userId" integer, "teamId" integer, CONSTRAINT "PK_11860d906290f929c95868ee7f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "team_requests" ADD CONSTRAINT "FK_f7837035690c0c42d12ecc8532b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_requests" ADD CONSTRAINT "FK_ad3bea744d1fe193fd1bcd49a5e" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_requests" DROP CONSTRAINT "FK_ad3bea744d1fe193fd1bcd49a5e"`);
        await queryRunner.query(`ALTER TABLE "team_requests" DROP CONSTRAINT "FK_f7837035690c0c42d12ecc8532b"`);
        await queryRunner.query(`DROP TABLE "team_requests"`);
        await queryRunner.query(`DROP TYPE "public"."team_requests_status_enum"`);
    }

}
