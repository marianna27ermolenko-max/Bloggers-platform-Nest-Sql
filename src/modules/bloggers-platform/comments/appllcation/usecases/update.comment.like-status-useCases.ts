import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';

export class UpdateCommentLikeStatusCommand extends Command<void> {
  constructor(
    public commentId: number,
    public userId: number,
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
    private readonly likesRepository: LikesRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusCommand): Promise<void> {
    console.log('UpdateCommentLikeStatusCommand', {
      commentId,
      userId,
      likeStatus,
    });
    await this.commentRepository.getByIdOrNotFoundFail(commentId);

    const like = await this.likesRepository.findLikeForСomment(
      userId,
      commentId,
    );

    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      await this.userRepository.getByIdOrNotFoundFail(userId);

      console.log({
        userId,
        commentId,
        likeStatus,
      });

      await this.likesRepository.createLikeForComment(
        userId,
        commentId,
        likeStatus,
      );

      await this.commentRepository.countNewLikeComment(
        commentId,
        LikeStatus.None,
        likeStatus,
      );
      return;
    }

    const newLike = likeStatus;
    const oldLike = like.likeStatus;

    if (newLike === oldLike) {
      return;
    }

    //если приходит статус нан - обновляем счетчики в коммент и удаляем сам лайк
    if (newLike === LikeStatus.None) {
      await this.commentRepository.countNewLikeComment(
        commentId,
        oldLike,
        newLike,
      );
      await this.likesRepository.deleteForComment(like.id);
      return;
    }

    await this.likesRepository.updateLikeStatusForComment(like.id, newLike);
    await this.commentRepository.countNewLikeComment(
      commentId,
      oldLike,
      newLike,
    );
  }
}
