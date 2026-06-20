import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import {
  Like,
  type LikeModelType,
  ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';

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
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private readonly commentRepository: CommentRepository,
    private readonly likesRepository: LikesRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateCommentLikeStatusCommand): Promise<void> {
    const comment =
      await this.commentRepository.getByIdOrNotFoundFail(commentId);

    const like = await this.likesRepository.findLike(
      userId,
      commentId,
      ParentType.Comment,
    );

    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      const user = await this.userRepository.getByIdOrNotFoundFail(userId);

      const createLike = this.LikeModel.createLike(
        userId,
        commentId,
        ParentType.Comment,
        likeStatus,
        user.login,
      );

      comment.countNewLike(likeStatus);

      await this.likesRepository.save(createLike);
      await this.commentRepository.save(comment);
      return;
    }

    const newLike = likeStatus;
    const oldLike = like.likeStatus;

    if (newLike === oldLike) {
      return;
    }

    //если приходит статус нан - обновляем счетчики в коммент и удаляем сам лайк
    if (newLike === LikeStatus.None) {
      comment.updateCountLikes(newLike, oldLike);
      await this.likesRepository.delete(like.id);
      await this.commentRepository.save(comment);

      return;
    }

    comment.updateCountLikes(newLike, oldLike);
    like.updateStatus(newLike);

    await this.likesRepository.save(like);
    await this.commentRepository.save(comment);
  }
}
