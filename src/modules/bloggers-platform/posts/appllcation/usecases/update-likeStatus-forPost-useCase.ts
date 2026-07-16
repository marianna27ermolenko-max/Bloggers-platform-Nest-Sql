import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { PostsSqlRepository } from '../../infrastructure/post.sql.repository';

export class UpdateLikeStatusForPostCommand extends Command<void> {
  constructor(
    public postId: number,
    public userId: number,
    public likeStatus: LikeStatus,
  ) {
    super();
  }
}

@CommandHandler(UpdateLikeStatusForPostCommand)
export class UpdateLikeStatusForPostCommandHandler implements ICommandHandler<
  UpdateLikeStatusForPostCommand,
  void
> {
  constructor(
    private readonly postsRepository: PostsSqlRepository,
    private readonly likesRepository: LikesRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdateLikeStatusForPostCommand): Promise<void> {
    await this.postsRepository.findByIdOrNotFoundFail(postId);
    const like = await this.likesRepository.findLikeForPost(userId, postId);

    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      await this.userRepository.getByIdOrNotFoundFail(userId);
      await this.likesRepository.createLikeForPost(userId, postId, likeStatus);
      await this.postsRepository.countNewLikePost(
        postId,
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

    //если приходит None — обновляем счетчики поста и удаляем лайк
    if (newLike === LikeStatus.None) {
      await this.likesRepository.deleteForPost(like.id);
    } else {
      await this.likesRepository.updateLikeStatusForPost(like.id, newLike);
    }

    await this.postsRepository.countNewLikePost(postId, oldLike, newLike);
  }
}
