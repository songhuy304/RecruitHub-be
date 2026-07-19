import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1784469681324 implements MigrationInterface {
    name = 'UpdateTable1784469681324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" RENAME COLUMN "departments" TO "departmentId"`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "departmentId"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "departmentId" integer`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_aaef5f7521893c38a50ded500d4" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_aaef5f7521893c38a50ded500d4"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "departmentId"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "departmentId" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3"`);
        await queryRunner.query(`ALTER TABLE "jobs" RENAME COLUMN "departmentId" TO "departments"`);
    }

}
