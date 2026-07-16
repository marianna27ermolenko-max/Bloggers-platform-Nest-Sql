import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentModelDBSql } from './query/type/comment.modelDB.sql';
import { LikeStatus } from '../../likes/domain/like.entity';

@Injectable()
export class CommentRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(
    postId: number,
    userId: number,
    dto: string,
  ): Promise<number> {
    const comment: { id: number }[] = await this.dataSource.query(
      `INSERT INTO comments
      (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [postId, userId, dto],
    );

    const commentId = comment[0].id;
    return commentId;
  }

  async updateComment(id: number, content: string): Promise<number> {
    const comment: { id: number }[] = await this.dataSource.query(
      `UPDATE comments
       SET content = $1
       WHERE id = $2
       RETURNING id`,
      [content, id],
    );

    const commentId = comment[0].id;
    return commentId;
  }

  async getByIdOrNotFoundFail(id: number): Promise<CommentModelDBSql> {
    const comment: CommentModelDBSql[] = await this.dataSource.query(
      `
      SELECT c.id, 
        c.post_id AS "postId",
        c.user_id AS "userId",
        c.content, 
        c.likes_count AS "likesCount", 
        c.dislikes_count AS "dislikesCount",
        c.created_at AS  "createdAt",
        u.login AS "userLogin"
      FROM comments AS c 
       JOIN users AS u ON u.id = c.user_id  
       WHERE c.id = $1
      `,
      [id],
    );

    const foundComment = comment[0];
    if (!foundComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
    return foundComment;
  }

  async deleteComment(commentId: number): Promise<void> {
    const result: { id: number }[] = await this.dataSource.query(
      `
      DELETE FROM comments
      WHERE id = $1
      RETURNING id
      `,
      [commentId],
    );

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
  }

  async countNewLikeComment(
    commentId: number,
    oldLikeStatus: LikeStatus,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    if (
      oldLikeStatus === LikeStatus.None &&
      newLikeStatus === LikeStatus.Like
    ) {
      await this.dataSource.query(
        `
          UPDATE comments 
          SET likes_count = likes_count + 1
          WHERE id = $1
          `,
        [commentId],
      );
    } else if (
      oldLikeStatus === LikeStatus.None &&
      newLikeStatus === LikeStatus.Dislike
    ) {
      await this.dataSource.query(
        `
          UPDATE comments 
          SET dislikes_count = dislikes_count + 1
          WHERE id = $1
          `,
        [commentId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Like &&
      newLikeStatus === LikeStatus.Dislike
    ) {
      await this.dataSource.query(
        `
          UPDATE comments 
          SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(likes_count - 1, 0)
          WHERE id = $1
          `,
        [commentId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Dislike &&
      newLikeStatus === LikeStatus.Like
    ) {
      await this.dataSource.query(
        `
          UPDATE comments 
          SET dislikes_count = GREATEST(dislikes_count - 1, 0), likes_count = likes_count + 1
          WHERE id = $1
          `,
        [commentId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Dislike &&
      newLikeStatus === LikeStatus.None
    ) {
      await this.dataSource.query(
        `
          UPDATE comments
          SET dislikes_count = GREATEST(dislikes_count - 1, 0)
          WHERE id = $1
          `,
        [commentId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Like &&
      newLikeStatus === LikeStatus.None
    ) {
      await this.dataSource.query(
        `
          UPDATE comments 
          SET likes_count = GREATEST(likes_count - 1, 0)
          WHERE id = $1
          `,
        [commentId],
      );
    }
  }
}
