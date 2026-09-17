import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1790103916040 implements MigrationInterface {
  name = 'CreatePosts1790103916040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."posts_privacy_enum" AS ENUM('public', 'unlisted', 'private')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_media_type_enum" AS ENUM('video')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."posts_status_enum" AS ENUM('scheduled', 'publishing', 'published', 'partial', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_targets_status_enum" AS ENUM('pending', 'publishing', 'published', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "userId" integer NOT NULL, "title" character varying NOT NULL, "description" text, "mediaUrl" character varying NOT NULL, "thumbnailUrl" character varying, "tags" text[], "privacy" "public"."posts_privacy_enum" NOT NULL DEFAULT 'private', "mediaType" "public"."posts_media_type_enum" NOT NULL DEFAULT 'video', "status" "public"."posts_status_enum" NOT NULL, "scheduledAt" TIMESTAMP, CONSTRAINT "PK_posts_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_userId" ON "posts" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_posts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_targets" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "postId" integer NOT NULL, "channelConnectionId" integer, "platform" "public"."channel_connections_platform_enum" NOT NULL, "status" "public"."post_targets_status_enum" NOT NULL DEFAULT 'pending', "externalPostId" character varying, "externalUrl" character varying, "errorMessage" text, "publishedAt" TIMESTAMP, CONSTRAINT "PK_post_targets_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_post_targets_postId_channelConnectionId" UNIQUE ("postId", "channelConnectionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_post_targets_postId" ON "post_targets" ("postId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_targets" ADD CONSTRAINT "FK_post_targets_postId" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_targets" ADD CONSTRAINT "FK_post_targets_channelConnectionId" FOREIGN KEY ("channelConnectionId") REFERENCES "channel_connections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_targets" DROP CONSTRAINT "FK_post_targets_channelConnectionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_targets" DROP CONSTRAINT "FK_post_targets_postId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_post_targets_postId"`);
    await queryRunner.query(`DROP TABLE "post_targets"`);
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_userId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_userId"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TYPE "public"."post_targets_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."posts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."posts_media_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."posts_privacy_enum"`);
  }
}
