import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeQuestionEntity1789981366122 implements MigrationInterface {
  name = 'ChangeQuestionEntity1789981366122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "question" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "question" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
