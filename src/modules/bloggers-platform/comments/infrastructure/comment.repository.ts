import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  async save(comment: Comment): Promise<void> {
    await this.commentRepository.save(comment);
  }

  // async createComment(
  //   postId: string,
  //   userId: string,
  //   dto: string,
  // ): Promise<string> {
  //   const comment: { id: string }[] = await this.dataSource.query(
  //     `INSERT INTO comments
  //     (post_id, user_id, content)
  //      VALUES ($1, $2, $3)
  //      RETURNING id`,
  //     [postId, userId, dto],
  //   );

  //   const commentId = comment[0].id;
  //   return commentId;
  // }

  // async updateComment(id: string, content: string): Promise<string> {
  //   const comment: { id: string }[] = await this.dataSource.query(
  //     `UPDATE comments
  //      SET content = $1
  //      WHERE id = $2
  //      RETURNING id`,
  //     [content, id],
  //   );

  //   const commentId = comment[0].id;
  //   return commentId;
  // }

  async getByIdOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    const result = await this.commentRepository.delete(id);

    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'comment not found',
      });
    }
  }

  // async countNewLikeComment(
  //   commentId: string,
  //   oldLikeStatus: LikeStatus,
  //   newLikeStatus: LikeStatus,
  // ): Promise<void> {
  //   if (
  //     oldLikeStatus === LikeStatus.None &&
  //     newLikeStatus === LikeStatus.Like
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET likes_count = likes_count + 1
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   } else if (
  //     oldLikeStatus === LikeStatus.None &&
  //     newLikeStatus === LikeStatus.Dislike
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET dislikes_count = dislikes_count + 1
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   } else if (
  //     oldLikeStatus === LikeStatus.Like &&
  //     newLikeStatus === LikeStatus.Dislike
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(likes_count - 1, 0)
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   } else if (
  //     oldLikeStatus === LikeStatus.Dislike &&
  //     newLikeStatus === LikeStatus.Like
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET dislikes_count = GREATEST(dislikes_count - 1, 0), likes_count = likes_count + 1
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   } else if (
  //     oldLikeStatus === LikeStatus.Dislike &&
  //     newLikeStatus === LikeStatus.None
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET dislikes_count = GREATEST(dislikes_count - 1, 0)
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   } else if (
  //     oldLikeStatus === LikeStatus.Like &&
  //     newLikeStatus === LikeStatus.None
  //   ) {
  //     await this.dataSource.query(
  //       `
  //         UPDATE comments
  //         SET likes_count = GREATEST(likes_count - 1, 0)
  //         WHERE id = $1
  //         `,
  //       [commentId],
  //     );
  //   }
  // }
}
