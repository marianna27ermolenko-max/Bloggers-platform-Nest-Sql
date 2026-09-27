import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionRepository } from '../../infrastructure/questions/question.repository';

export class DeleteQuestionCommand extends Command<void> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionCommandHandler implements ICommandHandler<
  DeleteQuestionCommand,
  void
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    await this.questionRepository.deleteQuestion(id);
  }
}
