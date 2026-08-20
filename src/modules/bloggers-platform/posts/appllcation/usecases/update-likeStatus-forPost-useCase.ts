import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  LikePost,
  LikeStatus,
} from 'src/modules/bloggers-platform/likes/domain/like.post.entity';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { PostsRepository } from '../../infrastructure/post.sql.repository';
import { LikesPostRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.post.repository';

export class UpdateLikeStatusForPostCommand extends Command<void> {
  constructor(
    public postId: string,
    public userId: string,
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
    private readonly postsRepository: PostsRepository,
    private readonly likesRepository: LikesPostRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdateLikeStatusForPostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrNotFoundFail(postId);
    const like = await this.likesRepository.findLike(userId, postId);

    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      const user = await this.userRepository.getByIdOrNotFoundFail(userId);
      const like = LikePost.create(userId, postId, user.login, likeStatus);
      await this.likesRepository.save(like);

      post.countNewLike(likeStatus);
      await this.postsRepository.save(post);

      return;
    }

    const newLike = likeStatus;
    const oldLike = like.likeStatus;

    if (newLike === oldLike) {
      return;
    }

    //если приходит None — обновляем счетчики поста и удаляем лайк
    if (newLike === LikeStatus.None) {
      post.updateCountLikes(likeStatus, oldLike);

      await this.likesRepository.deleteLike(like.id);
      await this.postsRepository.save(post);

      return;
    }

    post.updateCountLikes(newLike, oldLike);
    like.updateStatus(newLike);

    await this.likesRepository.save(like);
    await this.postsRepository.save(post);
  }
}
