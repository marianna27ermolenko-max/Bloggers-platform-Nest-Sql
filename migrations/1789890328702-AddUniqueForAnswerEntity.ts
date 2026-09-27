import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueForAnswerEntity1789890328702 implements MigrationInterface {
  name = 'AddUniqueForAnswerEntity1789890328702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "UQ_4416c50a2c0b61a101c10074bf6" UNIQUE ("playerId", "questionId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "UQ_4416c50a2c0b61a101c10074bf6"`,
    );
  }
}
