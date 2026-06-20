import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/appllcation/queries/view-dto/comment.view-dto';
import { PostsRepository } from '../../infrastructure/post.repository';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from 'src/modules/bloggers-platform/comments/domain/comment.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { CommentRepository } from 'src/modules/bloggers-platform/comments/infrastructure/comment.repository';
import { CommentsQwRepository } from 'src/modules/bloggers-platform/comments/infrastructure/query/comment.qw.repository';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { CommentInputDto } from 'src/modules/bloggers-platform/comments/api/input-dto/comment.input-dto';
import { Comment } from 'src/modules/bloggers-platform/comments/domain/comment.entity';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';

export class CreateCommandByPostIdCommand extends Command<CommentViewModel> {
  constructor(
    public postId: string,
    public userId: string,
    public dto: CommentInputDto,
  ) {
    super();
  }
}

@CommandHandler(CreateCommandByPostIdCommand)
export class CreateCommandByPostIdCommandHandler implements ICommandHandler<
  CreateCommandByPostIdCommand,
  CommentViewModel
> {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersExternalQueryRepository,
    private readonly commentRepository: CommentRepository,
    private readonly commentsQwRepository: CommentsQwRepository,
  ) {}

  async execute({
    postId,
    userId,
    dto,
  }: CreateCommandByPostIdCommand): Promise<CommentViewModel> {
    await this.postsRepository.getByIdOrNotFoundFail(postId);

    const user = await this.usersRepository.getByIdOrNotFoundFail(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User unauthorized',
      });
    }
    const comment = this.CommentModel.createComment(
      postId,
      userId,
      dto,
      user.login,
    );

    await this.commentRepository.save(comment);

    return this.commentsQwRepository.getComment(comment.id, LikeStatus.None);
  }
}
