import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { QuestionRepository } from '../../infrastructure/questions/question.repository';

export class UpdateQuestionByIdCommand extends Command<void> {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {
    super();
  }
}

@CommandHandler(UpdateQuestionByIdCommand)
export class UpdateQuestionByIdCommandHandler implements ICommandHandler<
  UpdateQuestionByIdCommand,
  void
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(command: UpdateQuestionByIdCommand): Promise<void> {
    const { id, body, correctAnswers } = command;
    const question = await this.questionRepository.findQuestion(id);

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'question not found',
      });
    }

    question.updateQuestion(body, correctAnswers);
    await this.questionRepository.save(question);
  }
}
