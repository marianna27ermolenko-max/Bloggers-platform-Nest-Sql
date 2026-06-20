import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogViewModel } from './view-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogsQuery extends Query<PaginatedViewDto<BlogViewModel[]>> {
  constructor(public queryParams: GetBlogsQueryParams) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<
  GetBlogsQuery,
  PaginatedViewDto<BlogViewModel[]>
> {
  constructor(private readonly blogsQwRepository: BlogsQwRepository) {}

  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogViewModel[]>> {
    return this.blogsQwRepository.getAll(query.queryParams);
  }
}
