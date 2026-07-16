import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class UpdateCommentCommand extends Command<void> {
  constructor(
    public commentId: number,
    public userId: number,
    public content: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentCommandHandler implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(private commentRepository: CommentRepository) {}

  async execute({
    commentId,
    userId,
    content,
  }: UpdateCommentCommand): Promise<void> {
    const comment =
      await this.commentRepository.getByIdOrNotFoundFail(commentId);

    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'The comment does not belong to the user',
      });
    }

    await this.commentRepository.updateComment(commentId, content);
  }
}
