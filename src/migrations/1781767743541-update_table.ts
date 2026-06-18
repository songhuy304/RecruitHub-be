import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1781767743541 implements MigrationInterface {
    name = 'UpdateTable1781767743541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_userId"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_team_members_teamId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_team_members_userId_teamId"`);
        await queryRunner.query(`CREATE TYPE "public"."teams_type_enum" AS ENUM('personal', 'organization')`);
        await queryRunner.query(`ALTER TABLE "teams" ADD "type" "public"."teams_type_enum" NOT NULL DEFAULT 'personal'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2f17b533905e0a94390c5e220" ON "team_members" ("userId", "teamId") `);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2f17b533905e0a94390c5e220"`);
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."teams_type_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_team_members_userId_teamId" ON "team_members" ("teamId", "userId") `);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_teamId" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members" ADD CONSTRAINT "FK_team_members_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
