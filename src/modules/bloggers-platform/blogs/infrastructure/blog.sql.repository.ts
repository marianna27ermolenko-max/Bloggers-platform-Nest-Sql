import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../domain/blog.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
  ) {}

  async save(blog: Blog): Promise<void> {
    await this.blogRepository.save(blog);
  }

  // async createBlog(dto: CreateBlogDto): Promise<string> {
  //   const { name, description, websiteUrl } = dto;

  //   const blogs: { id: string }[] = await this.dataSource.query(
  //     `INSERT INTO blogs (name, description, website_url)
  //     VALUES ($1, $2, $3) RETURNING id`,
  //     [name, description, websiteUrl],
  //   );

  //   const blogId = blogs[0].id;

  //   return blogId;
  // }

  // async updateBlog(id: string, dto: UpdateBlogDto): Promise<void> {
  //   const { name, description, websiteUrl } = dto;

  //   const blog: [{ id: number }[], number] = await this.dataSource.query(
  //     `
  //     UPDATE blogs
  //     SET name = $1, description = $2, website_url = $3
  //     WHERE id = $4
  //     RETURNING id
  //     `,
  //     [name, description, websiteUrl, id],
  //   );

  //   const updatedBlog = blog[0];

  //   if (updatedBlog.length === 0) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'blog not found',
  //     });
  //   }
  // }

  //возможно надо будет выдавать через другой маппер

  async getByIdOrNotFoundFail(
    id: string,
  ): Promise</* BlogViewModelSql */ Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    // return BlogViewModelSql.mapToView(blog);

    return blog;
  }

  async deleteBlog(id: string): Promise<void> {
    const result = await this.blogRepository.delete({ id });

    if (result.affected === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
  }

  // async deletePostByBlog(postId: string, blogId: string): Promise<void> {

  //   const result = await this.blogRepository
  //   // const result: [{ id: number }[], number] = await this.dataSource.query(
  //   //   `DELETE FROM posts
  //   //   WHERE id = $1 AND blog_id = $2
  //   //   RETURNING id`,
  //   //   [postId, blogId],
  //   // );

  //   // const resultDelete = result[1];

  //   if (resultDelete === 0) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'post not found',
  //     });
  //   }
  // }
}
