import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHgh1786550836027 implements MigrationInterface {
  name = 'AddHgh1786550836027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."like_likestatus_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "like" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "userId" uuid NOT NULL, "login" character varying NOT NULL, "likeStatus" "public"."like_likestatus_enum" NOT NULL, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT 'now()'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT '2026-08-09 23:43:01.307468+03'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT '2026-08-09 23:43:01.307468+03'`,
    );
    await queryRunner.query(`DROP TABLE "like"`);
    await queryRunner.query(`DROP TYPE "public"."like_likestatus_enum"`);
  }
}
