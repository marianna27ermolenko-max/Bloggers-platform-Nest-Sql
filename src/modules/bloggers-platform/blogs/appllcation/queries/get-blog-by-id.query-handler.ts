import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { BlogViewModel } from './view-dto/blog.view-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogByIdQuery extends Query<BlogViewModel> {
  constructor(
    public id: string,
    // public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewModel
> {
  constructor(private readonly blogsQwRepository: BlogsQwRepository) {}

  async execute(query: GetBlogByIdQuery): Promise<BlogViewModel> {
    return this.blogsQwRepository.getByIdOrNotFoundFail(query.id);
  }
}
