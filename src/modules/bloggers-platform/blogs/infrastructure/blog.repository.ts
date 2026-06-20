import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, type BlogModelType } from '../domain/blog.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return blog;
  }

  async deleteBlog(id: string): Promise<boolean> {
    const result = await this.BlogModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
