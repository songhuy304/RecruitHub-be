import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChannelConnectionsConnected1789903916040 implements MigrationInterface {
  name = 'AddChannelConnectionsConnected1789903916040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_connections" ADD COLUMN IF NOT EXISTS "connected" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_connections" DROP COLUMN IF EXISTS "connected"`,
    );
  }
}
