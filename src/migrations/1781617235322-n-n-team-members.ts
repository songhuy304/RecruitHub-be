import { MigrationInterface, QueryRunner } from "typeorm";

export class NNTeamMembers1781617235322 implements MigrationInterface {
    name = 'NNTeamMembers1781617235322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create the enum type for role
        await queryRunner.query(`CREATE TYPE "public"."team_members_role_enum" AS ENUM('OWNER', 'MEMBER')`);

        // 2. Create team_members table
        await queryRunner.query(`
            CREATE TABLE "team_members" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "teamId" integer NOT NULL,
                "role" "public"."team_members_role_enum" NOT NULL,
                CONSTRAINT "PK_team_members_id" PRIMARY KEY ("id")
            )
        `);

        // 3. Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "team_members" 
            ADD CONSTRAINT "FK_team_members_teamId" 
            FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // 4. Create compound unique index
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_team_members_userId_teamId" 
            ON "team_members" ("userId", "teamId")
        `);

        // 5. Migrate existing data from users to team_members
        // We check if the columns exist first to avoid errors during empty runs or clean database setups
        const hasTeamIdColumn = await queryRunner.hasColumn("users", "teamId");
        if (hasTeamIdColumn) {
            await queryRunner.query(`
                INSERT INTO "team_members" ("userId", "teamId", "role")
                SELECT "id" AS "userId", "teamId", "teamRole"::text::"public"."team_members_role_enum" AS "role"
                FROM "users"
                WHERE "teamId" IS NOT NULL AND "teamRole" IS NOT NULL
            `);

            // 6. Drop columns from users
            await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "teamId"`);
            await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "teamRole"`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop team_members table and custom types
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_team_members_userId_teamId"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_teamId"`);
        await queryRunner.query(`ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_userId"`);
        await queryRunner.query(`DROP TABLE "team_members"`);
        await queryRunner.query(`DROP TYPE "public"."team_members_role_enum"`);

        // Re-add columns to users if needed
        const hasTeamIdColumn = await queryRunner.hasColumn("users", "teamId");
        if (!hasTeamIdColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD "teamId" integer`);
            await queryRunner.query(`ALTER TABLE "users" ADD "teamRole" character varying`);
        }
    }
}
