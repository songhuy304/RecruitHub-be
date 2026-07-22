import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1784694446067 implements MigrationInterface {
    name = 'UpdateTable1784694446067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_44b548b5666511f79b31b5a020b"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "createdBy"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "createdById" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "assigneeId" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_942364c910910a09a018566455e" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_a23d67b70a8f54ded166f879b10" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_a23d67b70a8f54ded166f879b10"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_942364c910910a09a018566455e"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "assigneeId"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "createdBy" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_44b548b5666511f79b31b5a020b" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
