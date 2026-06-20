import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/comment.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class UpdateCommentCommand extends Command<void> {
  constructor(
    public commentId: string,
    public userId: string,
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

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentRepository.getByIdOrNotFoundFail(
      command.commentId,
    );

    if (comment.commentatorInfo.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'The comment does not belong to the user',
      });
    }

    comment.updateComment(command.content);
    await this.commentRepository.save(comment);
  }
}
