import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../appllcation/usecases/dto/create.blog.dto';
import { UpdateBlogDto } from '../dto/update.blog-dto';
import { BlogViewModelSql } from '../appllcation/queries/view-dto/blog.view-dto';
import { BlogModelBD } from '../appllcation/queries/view-dto/blog.model.BD';
// import { BlogModelBD } from '../appllcation/queries/view-dto/blog.model.BD';

//переписать на скль
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(dto: CreateBlogDto): Promise<number> {
    const { name, description, websiteUrl } = dto;

    const blogs: { id: number }[] = await this.dataSource.query(
      `INSERT INTO blogs (name, description, website_url) 
      VALUES ($1, $2, $3) RETURNING id`,
      [name, description, websiteUrl],
    );

    const blogId = blogs[0].id;

    return blogId;
  }

  async updateBlog(id: number, dto: UpdateBlogDto): Promise<void> {
    const { name, description, websiteUrl } = dto;

    const blog: [{ id: number }[], number] = await this.dataSource.query(
      `
      UPDATE blogs
      SET name = $1, description = $2, website_url = $3
      WHERE id = $4
      RETURNING id
      `,
      [name, description, websiteUrl, id],
    );

    const updatedBlog = blog[0];

    if (updatedBlog.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
  }

  //возможно надо будет выдавать через другой маппер
  async getByIdOrNotFoundFail(id: number): Promise<BlogViewModelSql> {
    const blogs: BlogModelBD[] = await this.dataSource.query(
      ` SELECT  id, 
         name, 
         description, 
         website_url AS "websiteUrl", 
         created_at AS  "createdAt",
         is_membership AS "isMembership"
        FROM blogs 
        WHERE id = $1`,
      [id],
    );

    console.log('Blog', blogs);

    const blog = blogs[0];

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return BlogViewModelSql.mapToView(blog);
  }

  async deleteBlog(id: number): Promise<void> {
    const result: [{ id: number }[], number] = await this.dataSource.query(
      `DELETE FROM blogs
      WHERE id = $1
      RETURNING id`,
      [id],
    );

    const resultDelete = result[0];

    if (resultDelete.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
  }

  async deletePostByBlog(postId: number, blogId: number): Promise<void> {
    const result: [{ id: number }[], number] = await this.dataSource.query(
      `DELETE FROM posts
      WHERE id = $1 AND blog_id = $2
      RETURNING id`,
      [postId, blogId],
    );

    const resultDelete = result[1];

    if (resultDelete === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'post not found',
      });
    }
  }
}
