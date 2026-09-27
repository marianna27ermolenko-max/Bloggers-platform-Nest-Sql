import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    await this.dataSource.query(
      `TRUNCATE "user", user_verification, "session", "blog", "post", comment, like_comment, like_post, "answer", game_question, "game", "player", "question" RESTART IDENTITY CASCADE`,
    );

    return {
      status: 'succeeded',
    };
  }
}
