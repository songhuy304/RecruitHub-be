import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1783524700908 implements MigrationInterface {
    name = 'UpdateTable1783524700908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "is_read" TO "isRead"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" RENAME COLUMN "isRead" TO "is_read"`);
    }

}
