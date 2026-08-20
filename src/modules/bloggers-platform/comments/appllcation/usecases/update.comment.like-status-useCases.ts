import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { LikesCommentRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.comment.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import {
  LikeComment,
  LikeStatus,
} from 'src/modules/bloggers-platform/likes/domain/like.comment.entity';

export class UpdateCommentLikeStatusCommand extends Command<void> {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusCommandHandler implements ICommandHandler<
  UpdateCommentLikeStatusCommand,
  void
> {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly likesRepository: LikesCommentRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusCommand): Promise<void> {
    const comment =
      await this.commentRepository.getByIdOrNotFoundFail(commentId);

    const like = await this.likesRepository.findLikeForСomment(
      userId,
      commentId,
    );

    //сценарий, если лайка не было
    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      const user = await this.userRepository.getByIdOrNotFoundFail(userId);

      const newLike = LikeComment.createLike(
        userId,
        commentId,
        user.login,
        likeStatus,
      );

      comment.countNewLike(likeStatus);

      await this.likesRepository.save(newLike);
      await this.commentRepository.save(comment);

      return;
    }

    const newLike = likeStatus;
    const oldLike = like.likeStatus;

    if (newLike === oldLike) {
      return;
    }

    //пользователь убирает реакцию - удаляем лайк
    if (newLike === LikeStatus.None) {
      comment.updateCountLikes(newLike, oldLike);

      await this.likesRepository.deleteForComment(like.id);
      await this.commentRepository.save(comment);
      return;
    }

    comment.updateCountLikes(newLike, oldLike);
    like.updateStatus(newLike);

    await this.likesRepository.save(like);
    await this.commentRepository.save(comment);
  }
}
