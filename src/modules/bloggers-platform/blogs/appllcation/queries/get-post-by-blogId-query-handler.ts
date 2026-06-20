import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewModel } from 'src/modules/bloggers-platform/posts/appllcation/queries/view-dto/post.view-dto';
import { BlogsQwRepository } from '../../infrastructure/query/blogs.query-repository';
import { PostsQwRepository } from 'src/modules/bloggers-platform/posts/infrastructure/query/post.query.repository';

export class GetPostsByBlogIdQuery extends Query<
  PaginatedViewDto<PostViewModel[]>
> {
  constructor(
    public blogId: string,
    public userId: string | null,
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
    private blogsQwRepository: BlogsQwRepository,
    private postsQwRepository: PostsQwRepository,
  ) {}

  async execute({
    blogId,
    userId,
    queryParams,
  }: GetPostsByBlogIdQuery): Promise<PaginatedViewDto<PostViewModel[]>> {
    await this.blogsQwRepository.getByIdOrNotFoundFail(blogId);
    return this.postsQwRepository.getAllByBlogId(blogId, queryParams, userId);
  }
}
