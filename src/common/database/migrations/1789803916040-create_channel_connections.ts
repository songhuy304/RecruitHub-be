import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChannelConnections1789803916040 implements MigrationInterface {
  name = 'CreateChannelConnections1789803916040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "youtube_connections" DROP CONSTRAINT IF EXISTS "FK_youtube_connections_userId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_connections"`);
    await queryRunner.query(
      `CREATE TYPE "public"."channel_connections_platform_enum" AS ENUM('youtube', 'tiktok', 'shopee')`,
    );
    await queryRunner.query(
      `CREATE TABLE "channel_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "userId" integer NOT NULL, "platform" "public"."channel_connections_platform_enum" NOT NULL, "externalId" character varying NOT NULL, "displayName" character varying NOT NULL, "email" character varying, "avatarUrl" character varying, "accessToken" text NOT NULL, "refreshToken" text, "tokenExpiresAt" TIMESTAMP NOT NULL, "scope" text, "metadata" jsonb, "connected" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_channel_connections_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_channel_connections_platform_externalId" UNIQUE ("platform", "externalId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_channel_connections_userId" ON "channel_connections" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "channel_connections" ADD CONSTRAINT "FK_channel_connections_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel_connections" DROP CONSTRAINT "FK_channel_connections_userId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_channel_connections_userId"`,
    );
    await queryRunner.query(`DROP TABLE "channel_connections"`);
    await queryRunner.query(
      `DROP TYPE "public"."channel_connections_platform_enum"`,
    );
  }
}
