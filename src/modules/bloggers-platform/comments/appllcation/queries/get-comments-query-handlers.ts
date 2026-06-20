import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CommentViewModel } from './view-dto/comment.view-dto';
import { CommentsQwRepository } from '../../infrastructure/query/comment.qw.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import {
  LikeStatus,
  ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';

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
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute({ id, userId }: GetCommentQuery): Promise<CommentViewModel> {
    if (!userId) {
      return this.commentsQwRepository.getComment(id, LikeStatus.None);
    }

    const like = await this.likesRepository.findLike(
      userId,
      id,
      ParentType.Comment,
    );

    if (!like) {
      return this.commentsQwRepository.getComment(id, LikeStatus.None);
    }

    return this.commentsQwRepository.getComment(id, like.likeStatus);
  }
}
