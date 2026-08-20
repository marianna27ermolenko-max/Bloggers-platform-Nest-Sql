import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLikesEntityUnique1786560968320 implements MigrationInterface {
  name = 'AddLikesEntityUnique1786560968320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_comment" ADD CONSTRAINT "UQ_1bb5c2ec13853fa236b3e66a046" UNIQUE ("userId", "commentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_post" ADD CONSTRAINT "UQ_3150faaf2b524dcdf285d099775" UNIQUE ("userId", "postId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like_post" DROP CONSTRAINT "UQ_3150faaf2b524dcdf285d099775"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like_comment" DROP CONSTRAINT "UQ_1bb5c2ec13853fa236b3e66a046"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "expirationDate" SET DEFAULT '2026-08-12 21:24:10.317235+03'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ALTER COLUMN "lastActiveDate" SET DEFAULT '2026-08-12 21:24:10.317235+03'`,
    );
  }
}
