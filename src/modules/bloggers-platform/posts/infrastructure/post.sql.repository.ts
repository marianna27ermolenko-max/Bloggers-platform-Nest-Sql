import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreatePostByBlogModel } from './type/create.post.byBlog.dto';
import { UpdatePostByBlogInputDto } from '../../blogs/appllcation/usecases/dto/update.post.byBlogModel';
import { PostRepositoryModel } from './type/post.pojo-model';
import { LikeStatus } from '../../likes/domain/like.entity';

export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPostByBlog(dto: CreatePostByBlogModel): Promise<number> {
    const { title, shortDescription, content, blogId } = dto;

    const result: { id: number }[] = await this.dataSource.query(
      `
      INSERT INTO posts
      (title, content, short_description, blog_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id`,
      [title, content, shortDescription, blogId],
    );

    const postId = result[0].id;
    return postId;
  }

  async updatePostByBlog(
    postId: number,
    blogId: number,
    dto: UpdatePostByBlogInputDto,
  ): Promise<void> {
    const { title, shortDescription, content } = dto;

    const result: [{ id: number }[], number] = await this.dataSource.query(
      `UPDATE posts
      SET title = $1, short_description = $2, content = $3
      WHERE id = $4 AND blog_id = $5
      RETURNING id`,
      [title, shortDescription, content, postId, blogId],
    );

    const resultUpdate = result[1];

    if (resultUpdate === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
  }

  async findByIdOrNotFoundFail(id: number): Promise<PostRepositoryModel> {
    const post: PostRepositoryModel[] = await this.dataSource.query(
      `SELECT 
         p.id, 
         p.title, 
         p.short_description AS "shortDescription", 
         p.content, 
         p.likes_count AS "likesCount", 
         p.dislikes_count AS "dislikesCount", 
         p.created_at AS "createdAt", 
         p.blog_id AS "blogId", 
         b.name AS "blogName" 
      FROM posts AS p   
      JOIN blogs AS b 
      ON b.id = p.blog_id 
      WHERE p.id =$1 `,
      [id],
    );

    const foundPost = post[0];

    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
    return foundPost;
  }

  async countNewLikePost(
    postId: number,
    oldLikeStatus: LikeStatus,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    if (
      oldLikeStatus === LikeStatus.None &&
      newLikeStatus === LikeStatus.Like
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET likes_count = likes_count + 1
        WHERE id = $1
        `,
        [postId],
      );
    } else if (
      oldLikeStatus === LikeStatus.None &&
      newLikeStatus === LikeStatus.Dislike
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET dislikes_count = dislikes_count + 1
        WHERE id = $1
        `,
        [postId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Like &&
      newLikeStatus === LikeStatus.Dislike
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET dislikes_count = dislikes_count + 1, likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = $1
        `,
        [postId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Dislike &&
      newLikeStatus === LikeStatus.Like
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET dislikes_count = GREATEST(dislikes_count - 1, 0), likes_count = likes_count + 1
        WHERE id = $1
        `,
        [postId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Dislike &&
      newLikeStatus === LikeStatus.None
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET dislikes_count = GREATEST(dislikes_count - 1, 0)
        WHERE id = $1
        `,
        [postId],
      );
    } else if (
      oldLikeStatus === LikeStatus.Like &&
      newLikeStatus === LikeStatus.None
    ) {
      await this.dataSource.query(
        `
        UPDATE posts 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = $1
        `,
        [postId],
      );
    }
  }

  // async deletePost(id: number): Promise<boolean> {
  //   const result = await this.PostModel.deleteOne({ _id: id });
  //   return result.deletedCount === 1;
  // }
}
