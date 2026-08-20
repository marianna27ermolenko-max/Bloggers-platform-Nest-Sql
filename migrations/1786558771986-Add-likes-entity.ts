import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLikesEntity1786558771986 implements MigrationInterface {
  name = 'AddLikesEntity1786558771986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."like_comment_likestatus_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "like_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "userId" uuid NOT NULL, "commentId" uuid NOT NULL, "login" character varying NOT NULL, "likeStatus" "public"."like_comment_likestatus_enum" NOT NULL, CONSTRAINT "PK_307553e232b4620fde327c59eb5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."like_post_likestatus_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "like_post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "userId" uuid NOT NULL, "postId" uuid NOT NULL, "login" character varying NOT NULL, "likeStatus" "public"."like_post_likestatus_enum" NOT NULL, CONSTRAINT "PK_d41caa70371e578e2a4791a88ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_comment" ADD CONSTRAINT "FK_2f5824ee63b58747dc99f3283ae" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_post" ADD CONSTRAINT "FK_7f66f3cfa3c598cd0d537ab1c68" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like_post" DROP CONSTRAINT "FK_7f66f3cfa3c598cd0d537ab1c68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_comment" DROP CONSTRAINT "FK_2f5824ee63b58747dc99f3283ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT '2026-08-09 23:43:01.307468+03'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT '2026-08-09 23:43:01.307468+03'`,
    );
    await queryRunner.query(`DROP TABLE "like_post"`);
    await queryRunner.query(`DROP TYPE "public"."like_post_likestatus_enum"`);
    await queryRunner.query(`DROP TABLE "like_comment"`);
    await queryRunner.query(
      `DROP TYPE "public"."like_comment_likestatus_enum"`,
    );
  }
}
