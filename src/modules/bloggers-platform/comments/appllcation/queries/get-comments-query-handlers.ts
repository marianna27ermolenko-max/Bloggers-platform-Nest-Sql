import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CommentViewModel } from './view-dto/comment.view-dto';
import { CommentsQwRepository } from '../../infrastructure/query/comment.qw-sql.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';

export class GetCommentQuery extends Query<CommentViewModel> {
  constructor(
    public id: number,
    public userId: number | null,
  ) {
    super();
  }
}

@QueryHandler(GetCommentQuery)
export class GetCommentQueryHandler implements IQueryHandler<
  GetCommentQuery,
  CommentViewModel
> {
  constructor(
    private readonly commentsQwRepository: CommentsQwRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute({ id, userId }: GetCommentQuery): Promise<CommentViewModel> {
    if (userId === null) {
      return this.commentsQwRepository.getCommentById(id, LikeStatus.None);
    }

    const like = await this.likesRepository.findLikeForСomment(userId, id);

    return this.commentsQwRepository.getCommentById(
      id,
      like?.likeStatus ?? LikeStatus.None,
    );
  }
}
