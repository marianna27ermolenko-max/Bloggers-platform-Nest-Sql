import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { QuestionSaViewModel } from '../../api/view-dto/questionSaViewModel';
import { GetQuestionQueryParams } from '../../api/input-dto/get-questions-query-params.input-dto';
import { QuestionQwrRepository } from '../../infrastructure/questions/question-qwr.repository';

export class GetAllQuestionsQuery extends Query<
  PaginatedViewDto<QuestionSaViewModel[]>
> {
  constructor(public queryParams: GetQuestionQueryParams) {
    super();
  }
}

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuestionsQueryHandler implements IQueryHandler<
  GetAllQuestionsQuery,
  PaginatedViewDto<QuestionSaViewModel[]>
> {
  constructor(private readonly questionQwrRepository: QuestionQwrRepository) {}

  async execute(
    query: GetAllQuestionsQuery,
  ): Promise<PaginatedViewDto<QuestionSaViewModel[]>> {
    const result = await this.questionQwrRepository.getAll(query.queryParams);
    return result;
  }
}
