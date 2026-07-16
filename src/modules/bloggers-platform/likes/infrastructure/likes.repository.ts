import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikePostModelDB } from './type/like-for-post.type.modelDB';
import { LikeStatus } from '../domain/like.entity';
import { LikeCommentModelDB } from './type/like-for-comment.type.modelDB';
import {
  NewestLikesDbModel,
  NewestLikesForPost,
} from '../../posts/infrastructure/query/type/newest.likes.for.post.type';

export class LikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  //лайки для постов
  async findLikeForPost(
    userId: number,
    postId: number,
  ): Promise<LikePostModelDB | null> {
    const like: LikePostModelDB[] = await this.dataSource.query(
      ` SELECT id, 
          post_id AS "postId",
          user_id AS "userId",
          like_status AS "likeStatus", 
          created_at AS "createdAt"
          FROM post_likes
          WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );

    const findLike = like[0];
    if (!findLike) return null;

    return findLike;
  }

  async findLikesForPosts(
    userId: number,
    postIds: number[],
  ): Promise<LikePostModelDB[]> {
    return await this.dataSource.query(
      ` SELECT id, 
          post_id AS "postId",
          user_id AS "userId",
          like_status AS "likeStatus", 
          created_at AS "createdAt"
          FROM post_likes
          WHERE user_id = $1 AND post_id = ANY($2)`,
      [userId, postIds],
    );
  }

  async findNewestLikesDbForPost(
    postId: number,
  ): Promise<NewestLikesForPost[]> {
    const likes: NewestLikesForPost[] = await this.dataSource.query(
      ` SELECT 
          p.user_id AS "userId",
          p.created_at AS "addedAt",
          u.login
          FROM post_likes AS p
          JOIN users AS u ON p.user_id = u.id
          WHERE p.post_id = $1 AND p.like_status = 'Like'
          ORDER BY p.created_at DESC
          LIMIT 3
         `,
      [postId],
    );

    return likes;
  }

  async findNewestLikesDbForPosts(
    postIds: number[],
  ): Promise<NewestLikesDbModel[]> {
    const likes: NewestLikesDbModel[] = await this.dataSource.query(
      ` SELECT "postId", "userId", "addedAt", login
        FROM (
    SELECT
    pl.post_id AS "postId", 
    pl.user_id AS "userId",
    pl.created_at AS "addedAt",
    u.login,

    ROW_NUMBER() OVER (
      PARTITION BY pl.post_id
      ORDER BY pl.created_at DESC, pl.id DESC
    ) AS rn

  FROM post_likes AS pl

  JOIN users AS u 
    ON pl.user_id = u.id

  WHERE pl.post_id = ANY($1)
    AND pl.like_status = 'Like'

                            ) likes

  WHERE rn <= 3
  ORDER BY "postId", "addedAt" DESC;
 `,
      [postIds],
    );

    return likes;
  }

  async createLikeForPost(
    userId: number,
    postId: number,
    likeStatus: LikeStatus,
  ): Promise<number> {
    const like: { id: number }[] = await this.dataSource.query(
      `INSERT INTO post_likes
       (user_id, post_id, like_status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, postId, likeStatus],
    );

    const likeId = like[0].id;

    return likeId;
  }

  async updateLikeStatusForPost(
    id: number,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE post_likes
       SET like_status = $1
       WHERE id = $2`,
      [newLikeStatus, id],
    );
  }

  async deleteForPost(id: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM post_likes
       WHERE id = $1
      `,
      [id],
    );
  }

  //лайки для комментариев
  async findLikeForСomment(
    userId: number,
    commentId: number,
  ): Promise<LikeCommentModelDB | null> {
    const like: LikeCommentModelDB[] = await this.dataSource.query(
      ` SELECT id, 
          comment_id AS "commentId",
          user_id AS "userId",
          like_status AS "likeStatus", 
          created_at AS "createdAt"
          FROM comments_likes
          WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId],
    );

    const findLike = like[0];
    if (!findLike) return null;

    return findLike;
  }

  async findLikesForComments(
    userId: number,
    commentIds: number[],
  ): Promise<LikeCommentModelDB[]> {
    return await this.dataSource.query(
      ` SELECT id, 
          comment_id AS "commentId",
          user_id AS "userId",
          like_status AS "likeStatus", 
          created_at AS "createdAt"
          FROM comments_likes
          WHERE user_id = $1 AND comment_id = ANY($2)`,
      [userId, commentIds],
    );
  }

  async createLikeForComment(
    userId: number,
    commentId: number,
    likeStatus: LikeStatus,
  ): Promise<number> {
  
    const like: { id: number }[] = await this.dataSource.query(
      `INSERT INTO comments_likes
       (user_id, comment_id, like_status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, commentId, likeStatus],
    );

    const likeId = like[0].id;

    return likeId;
  }

  async updateLikeStatusForComment(
    id: number,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE comments_likes
       SET like_status = $1
       WHERE id = $2`,
      [newLikeStatus, id],
    );
  }
  async deleteForComment(id: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM comments_likes
       WHERE id = $1
      `,
      [id],
    );
  }
}
