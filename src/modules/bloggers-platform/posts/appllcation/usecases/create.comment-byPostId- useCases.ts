import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewModel } from 'src/modules/bloggers-platform/comments/appllcation/queries/view-dto/comment.view-dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { LikeStatus } from 'src/modules/bloggers-platform/likes/domain/like.entity';
import { CommentInputDto } from 'src/modules/bloggers-platform/comments/api/input-dto/comment.input-dto';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { PostsSqlRepository } from '../../infrastructure/post.sql.repository';
import { CommentRepository } from 'src/modules/bloggers-platform/comments/infrastructure/comment.repository';
import { CommentsQwRepository } from 'src/modules/bloggers-platform/comments/infrastructure/query/comment.qw-sql.repository';

export class CreateCommandByPostIdCommand extends Command<CommentViewModel> {
  constructor(
    public postId: number,
    public userId: number,
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
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly usersRepository: UsersExternalQueryRepository,
    private readonly commentRepository: CommentRepository,
    private readonly commentsQwRepository: CommentsQwRepository,
  ) {}

  async execute({
    postId,
    userId,
    dto,
  }: CreateCommandByPostIdCommand): Promise<CommentViewModel> {
    await this.postsSqlRepository.findByIdOrNotFoundFail(postId);

    const user = await this.usersRepository.getByIdOrNotFoundFail(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'User unauthorized',
      });
    }

    const commentId = await this.commentRepository.createComment(
      postId,
      userId,
      dto.content,
    );

    return this.commentsQwRepository.getCommentById(commentId, LikeStatus.None);
  }
}
