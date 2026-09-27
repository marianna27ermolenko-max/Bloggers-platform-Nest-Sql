import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/questions/question.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class UpdateQuestionPublishedCommand extends Command<void> {
  constructor(
    public id: string,
    public published: boolean,
  ) {
    super();
  }
}

@CommandHandler(UpdateQuestionPublishedCommand)
export class UpdateQuestionPublishedCommandHandler implements ICommandHandler<
  UpdateQuestionPublishedCommand,
  void
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute({
    id,
    published,
  }: UpdateQuestionPublishedCommand): Promise<void> {
    const question = await this.questionRepository.findQuestion(id);

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'question not found',
      });
    }

    if (published && !question.correctAnswers) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
      });
    }

    question.updatePublished(published);
    await this.questionRepository.save(question);
  }
}
