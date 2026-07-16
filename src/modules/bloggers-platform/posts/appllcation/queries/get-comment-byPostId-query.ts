import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/appllcation/queries/view-dto/comment.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { CommentsQwRepository } from 'src/modules/bloggers-platform/comments/infrastructure/query/comment.qw-sql.repository';
import { PostsSqlRepository } from '../../infrastructure/post.sql.repository';

export class GetCommentByPostIdQuery extends Query<
  PaginatedViewDto<CommentViewModel[]>
> {
  constructor(
    public postId: number,
    public userId: number | null,
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
    private readonly postsRepository: PostsSqlRepository,
    private readonly commentsQwRepository: CommentsQwRepository,
  ) {}

  async execute({
    postId,
    userId,
    queryParams,
  }: GetCommentByPostIdQuery): Promise<PaginatedViewDto<CommentViewModel[]>> {
    await this.postsRepository.findByIdOrNotFoundFail(postId);
    return this.commentsQwRepository.getCommentsByPostId(
      postId,
      queryParams,
      userId,
    );
  }
}
