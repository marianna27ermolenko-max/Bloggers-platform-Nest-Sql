import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { Repository } from 'typeorm';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { QuestionSaViewModel } from '../../api/view-dto/questionSaViewModel';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { PublishedStatus } from '../../dto/question/query.enum.dto';
import {
  GetQuestionQueryParams,
  QuestionSortBy,
} from '../../api/input-dto/get-questions-query-params.input-dto';

@Injectable()
export class QuestionQwrRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionQwrRepository: Repository<Question>,
  ) {}

  async getAll(
    query: GetQuestionQueryParams,
  ): Promise<PaginatedViewDto<QuestionSaViewModel[]>> {
    const { sortBy, bodySearchTerm, pageNumber, pageSize, publishedStatus } =
      query;

    const sortDirection =
      query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';

    const qb = this.questionQwrRepository.createQueryBuilder('q');

    if (bodySearchTerm) {
      qb.where('q.body ILIKE :body', { body: `%${bodySearchTerm}%` });
    }

    if (
      publishedStatus === PublishedStatus.published ||
      publishedStatus === PublishedStatus.notPublished
    ) {
      qb.andWhere('q.published = :published', {
        published: publishedStatus === PublishedStatus.published,
      });
    }

    if (sortBy === QuestionSortBy.CreatedAt) {
      qb.orderBy('q.createdAt', sortDirection);
    } else {
      qb.orderBy('q.body COLLATE "C"', sortDirection);
    }

    const [questions, totalCount] = await qb
      .skip(query.calculateSkip())
      .take(pageSize)
      .getManyAndCount();

    const items = questions.map((q) => QuestionSaViewModel.mapToView(q));

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
