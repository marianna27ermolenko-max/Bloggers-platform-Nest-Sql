import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Like,
  type LikeModelType,
  LikeStatus,
  ParentType,
} from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { PostsRepository } from '../../infrastructure/post.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/likes/infrastructure/likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';

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
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private readonly postsRepository: PostsRepository,
    private readonly likesRepository: LikesRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}
  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdateLikeStatusForPostCommand): Promise<void> {
    const post = await this.postsRepository.getByIdOrNotFoundFail(postId);
    const like = await this.likesRepository.findLike(
      userId,
      postId,
      ParentType.Post,
    );

    if (!like) {
      if (likeStatus === LikeStatus.None) {
        return;
      }

      const user = await this.userRepository.getByIdOrNotFoundFail(userId);

      const createLike = this.LikeModel.createLike(
        userId,
        postId,
        ParentType.Post,
        likeStatus,
        user.login,
      );

      post.countNewLike(likeStatus);
      await this.likesRepository.save(createLike);
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
      post.updateCountLikes(newLike, oldLike);
      await this.likesRepository.delete(like.id);
      await this.postsRepository.save(post);

      return;
    }

    post.updateCountLikes(newLike, oldLike);
    like.updateStatus(newLike);

    await this.likesRepository.save(like);
    await this.postsRepository.save(post);
  }
}
