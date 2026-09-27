import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionSaViewModel } from '../../api/view-dto/questionSaViewModel';
import { Question } from '../../domain/question.entity';
import { QuestionRepository } from '../../infrastructure/questions/question.repository';

export class CreateQuestionCommand extends Command<QuestionSaViewModel> {
  constructor(
    public body: string,
    public answers: string[],
  ) {
    super();
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionCommandHandler implements ICommandHandler<
  CreateQuestionCommand,
  QuestionSaViewModel
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute({
    body,
    answers,
  }: CreateQuestionCommand): Promise<QuestionSaViewModel> {
    const question = Question.createQuestion(body, answers);
    await this.questionRepository.save(question);

    const viewModel = QuestionSaViewModel.mapToView(question);

    return viewModel;
  }
}
