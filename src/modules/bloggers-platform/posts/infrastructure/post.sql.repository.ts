import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { LikeStatus } from '../../likes/domain/like.post.entity';
import { Post } from '../domain/post.entity';

export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private repositoryPost: Repository<Post>,
  ) {}

  async save(post: Post): Promise<void> {
    await this.repositoryPost.save(post);
  }

  async findByIdAndBlogIdOrNotFoundFail(
    postId: string,
    blogId: string,
  ): Promise<Post> {
    const post = await this.repositoryPost.findOne({
      where: { id: postId, blogId },
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    return post;
  }

  // async createPostByBlog(dto: CreatePostByBlogModel): Promise<string> {
  //   const { title, shortDescription, content, blogId } = dto;

  //   const result: { id: string }[] = await this.dataSource.query(
  //     `
  //     INSERT INTO posts
  //     (title, content, short_description, blog_id)
  //     VALUES ($1, $2, $3, $4)
  //     RETURNING id`,
  //     [title, content, shortDescription, blogId],
  //   );

  //   const postId = result[0].id;
  //   return postId;
  // }

  // async updatePostByBlog(
  //   postId: string,
  //   blogId: string,
  //   dto: UpdatePostByBlogInputDto,
  // ): Promise<void> {
  //   const { title, shortDescription, content } = dto;

  //   const result: [{ id: number }[], number] = await this.dataSource.query(
  //     `UPDATE posts
  //     SET title = $1, short_description = $2, content = $3
  //     WHERE id = $4 AND blog_id = $5
  //     RETURNING id`,
  //     [title, shortDescription, content, postId, blogId],
  //   );

  //   const resultUpdate = result[1];

  //   if (resultUpdate === 0) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'post not found',
  //     });
  //   }
  // }

  async findByIdOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.repositoryPost.findOne({
      where: { id },
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }

    return post;
  }

  async deletePostByBlog(postId: string, blogId: string): Promise<void> {
    const result = await this.repositoryPost.delete({ id: postId, blogId });
    // const result: [{ id: number }[], number] = await this.dataSource.query(
    //   `DELETE FROM posts
    //   WHERE id = $1 AND blog_id = $2
    //   RETURNING id`,
    //   [postId, blogId],
    // );

    // const resultDelete = result[1];

    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
  }

  async countNewLikePost(
    postId: string,
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
}
