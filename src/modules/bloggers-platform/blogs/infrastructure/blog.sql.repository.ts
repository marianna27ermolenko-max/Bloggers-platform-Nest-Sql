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
}
