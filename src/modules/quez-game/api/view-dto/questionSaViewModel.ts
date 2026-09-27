import { Question } from '../../domain/question.entity';

export class QuestionSaViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;

  static mapToView(question: Question): QuestionSaViewModel {
    const viewModel = new QuestionSaViewModel();
    viewModel.id = question.id;
    viewModel.body = question.body;
    viewModel.correctAnswers = question.correctAnswers;
    viewModel.published = question.published;
    viewModel.createdAt = question.createdAt.toISOString();
    viewModel.updatedAt = question.updatedAt
      ? question.updatedAt.toISOString()
      : null;

    return viewModel;
  }
}
