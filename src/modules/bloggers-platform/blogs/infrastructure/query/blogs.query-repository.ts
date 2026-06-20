import { Injectable } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewModel } from '../../appllcation/queries/view-dto/blog.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { Blog } from '../../domain/blog.entity';
import { BlogsFilter } from './type/filter.type';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../../domain/blog.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsQwRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    const filter: BlogsFilter = {};

    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);
    const items = blogs.map((blog) => BlogViewModel.mapToView(blog));

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewModel> {
    const blog = await this.BlogModel.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'blog not found',
      });
    }
    return BlogViewModel.mapToView(blog);
  }
}
