import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogViewModelSql } from './view-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogsQwSqlRepository } from '../../infrastructure/query/blogs.query.sql-repository';

export class GetBlogsQuery extends Query<PaginatedViewDto<BlogViewModelSql[]>> {
  constructor(public queryParams: GetBlogsQueryParams) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<
  GetBlogsQuery,
  PaginatedViewDto<BlogViewModelSql[]>
> {
  constructor(private readonly blogsQwSqlRepository: BlogsQwSqlRepository) {}

  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogViewModelSql[]>> {
    return this.blogsQwSqlRepository.getAll(query.queryParams);
  }
}
