import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { BlogViewModelSql } from './view-dto/blog.view-dto';
import { BlogsQwSqlRepository } from '../../infrastructure/query/blogs.query.sql-repository';

export class GetBlogByIdQuery extends Query<BlogViewModelSql> {
  constructor(
    public id: number,
    // public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewModelSql
> {
  constructor(private readonly blogsQwSqlRepository: BlogsQwSqlRepository) {}

  async execute(query: GetBlogByIdQuery): Promise<BlogViewModelSql> {
    return this.blogsQwSqlRepository.getByIdOrNotFoundFail(query.id);
  }
}
