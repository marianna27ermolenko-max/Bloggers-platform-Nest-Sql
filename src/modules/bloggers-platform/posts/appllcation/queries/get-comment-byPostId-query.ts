import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/appllcation/queries/view-dto/comment.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostsRepository } from '../../infrastructure/post.repository';
import { CommentsQwRepository } from 'src/modules/bloggers-platform/comments/infrastructure/query/comment.qw.repository';

export class GetCommentByPostIdQuery extends Query<
  PaginatedViewDto<CommentViewModel[]>
> {
  constructor(
    public postId: string,
    public userId: string | null,
    public queryParams: GetPostsQueryParams,
  ) {
    super();
  }
}

@QueryHandler(GetCommentByPostIdQuery)
export class GetCommentByPostIdQueryHandler implements IQueryHandler<
  GetCommentByPostIdQuery,
  PaginatedViewDto<CommentViewModel[]>
> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsQwRepository: CommentsQwRepository,
  ) {}

  async execute({
    postId,
    userId,
    queryParams,
  }: GetCommentByPostIdQuery): Promise<PaginatedViewDto<CommentViewModel[]>> {
    await this.postsRepository.getByIdOrNotFoundFail(postId);
    return this.commentsQwRepository.getCommentsByPostId(
      postId,
      queryParams,
      userId,
    );
  }
}
