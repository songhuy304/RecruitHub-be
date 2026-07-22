import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1784708436687 implements MigrationInterface {
    name = 'UpdateTable1784708436687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "assigneeId" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_a23d67b70a8f54ded166f879b10" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_a23d67b70a8f54ded166f879b10"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "assigneeId"`);
    }

}
