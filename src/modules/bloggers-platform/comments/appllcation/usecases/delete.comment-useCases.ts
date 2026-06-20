import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class DeleteCommentCommand extends Command<void> {
  constructor(
    public commentId: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentCommandHandler implements ICommandHandler<
  DeleteCommentCommand,
  void
> {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
    const comment =
      await this.commentRepository.getByIdOrNotFoundFail(commentId);

    if (comment.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    await this.commentRepository.deleteComment(commentId);
  }
}
