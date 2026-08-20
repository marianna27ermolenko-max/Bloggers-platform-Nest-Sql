import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CommentViewModel } from './view-dto/comment.view-dto';
import { CommentsQwRepository } from '../../infrastructure/query/comment.qw-sql.repository';
import { LikesCommentRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.comment.repository';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.comment.entity';

export class GetCommentQuery extends Query<CommentViewModel> {
  constructor(
    public id: string,
    public userId: string | null,
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
    private readonly likesRepository: LikesCommentRepository,
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
