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
      `TRUNCATE users, user_verifications, sessions, blogs, posts, comments, comments_likes, post_likes RESTART IDENTITY`,
    );

    return {
      status: 'succeeded',
    };
  }
}
