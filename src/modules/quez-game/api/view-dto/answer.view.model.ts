import { AnswerStatuses } from '../../domain/answer.entity';

export class AnswerViewModel {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string;

  static mapViewModel(
    questionId: string,
    answerStatus: AnswerStatuses,
    addedAt: string,
  ): AnswerViewModel {
    const viewModel = new AnswerViewModel();

    viewModel.questionId = questionId;
    viewModel.answerStatus = answerStatus;
    viewModel.addedAt = addedAt;

    return viewModel;
  }
}
