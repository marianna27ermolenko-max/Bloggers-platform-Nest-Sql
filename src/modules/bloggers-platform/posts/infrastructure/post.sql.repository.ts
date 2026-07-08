import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreatePostByBlogModel } from './type/create.post.byBlog.dto';
import { UpdatePostByBlogInputDto } from '../../blogs/appllcation/usecases/dto/update.post.byBlogModel';

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

  //     async getByIdOrNotFoundFail(id: number): Promise<PostRepositoryModel> {
  //   const post = await this.PostModel.findOne({ _id: id });
  //   if (!post) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'post not found',
  //     });
  //   }
  //   return post;
  // }

  //   async deletePost(id: number): Promise<boolean> {
  //     const result = await this.PostModel.deleteOne({ _id: id });
  //     return result.deletedCount === 1;
  //   }
}
