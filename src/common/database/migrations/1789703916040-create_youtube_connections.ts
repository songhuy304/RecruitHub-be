import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateYoutubeConnections1789703916040 implements MigrationInterface {
  name = 'CreateYoutubeConnections1789703916040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "youtube_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "userId" integer NOT NULL, "googleId" character varying NOT NULL, "email" character varying NOT NULL, "accessToken" text NOT NULL, "refreshToken" text, "tokenExpiresAt" TIMESTAMP NOT NULL, "scope" text, "channelId" character varying, "channelTitle" character varying, "channelThumbnail" character varying, CONSTRAINT "PK_youtube_connections_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_youtube_connections_userId" UNIQUE ("userId"), CONSTRAINT "UQ_youtube_connections_googleId" UNIQUE ("googleId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_connections" ADD CONSTRAINT "FK_youtube_connections_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "youtube_connections" DROP CONSTRAINT "FK_youtube_connections_userId"`,
    );
    await queryRunner.query(`DROP TABLE "youtube_connections"`);
  }
}
