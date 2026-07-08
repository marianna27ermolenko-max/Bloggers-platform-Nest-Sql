import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PostViewModel } from './view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostsQwSqlRepository } from '../../infrastructure/query/post.query.sql.repository';

export class GetAllPostQuery extends Query<PaginatedViewDto<PostViewModel[]>> {
  constructor(public queryParams: GetPostsQueryParams) {
    super();
  }
}

@QueryHandler(GetAllPostQuery)
export class GetAllPostQueryHandler implements IQueryHandler<
  GetAllPostQuery,
  PaginatedViewDto<PostViewModel[]>
> {
  constructor(private postsQwSqlRepository: PostsQwSqlRepository) {}

  async execute(
    query: GetAllPostQuery,
  ): Promise<PaginatedViewDto<PostViewModel[]>> {
    const result = await this.postsQwSqlRepository.getAll(query.queryParams);
    return result;
  }
}
