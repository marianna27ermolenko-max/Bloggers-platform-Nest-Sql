import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
import { BlogsQwSqlRepository } from '../../infrastructure/query/blogs.query.sql-repository';
import { PostsQwSqlRepository } from 'src/modules/bloggers-platform/posts/infrastructure/query/post.query.sql.repository';

export class GetPostsByBlogIdQuery extends Query<
  PaginatedViewDto<PostViewModel[]>
> {
  constructor(
    public blogId: number,
    // public userId: number | null,
    public queryParams: GetPostsQueryParams,
  ) {
    super();
  }
}

@QueryHandler(GetPostsByBlogIdQuery)
export class GetPostsByBlogIdQueryHandler implements IQueryHandler<
  GetPostsByBlogIdQuery,
  PaginatedViewDto<PostViewModel[]>
> {
  constructor(
    private blogsQwRepository: BlogsQwSqlRepository,
    private postsQwRepository: PostsQwSqlRepository,
  ) {}

  async execute({
    blogId,
    // userId,
    queryParams,
  }: GetPostsByBlogIdQuery): Promise<PaginatedViewDto<PostViewModel[]>> {
    await this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
    return this.postsQwRepository.getAllByBlogId(
      blogId,
      queryParams /* userId */,
    );
  }
}
