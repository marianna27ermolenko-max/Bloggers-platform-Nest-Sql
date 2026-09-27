import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from 'src/modules/user-accounts/guard/basic/basic-auth.guard';
import { QuestionInputModel } from '../dto/question/question.create.input.model';
import { QuestionSaViewModel } from './view-dto/questionSaViewModel';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionUpdateInputModel } from '../dto/question/question.update.input.model';
import { UpdateQuestionByIdCommand } from '../application/usecases/update-question.usecase';
import { UpdateQuestionPublishedCommand } from '../application/usecases/updatePublish-question.usecase';
import { PublishInputModel } from '../dto/question/question.update.status-input';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GetQuestionQueryParams } from './input-dto/get-questions-query-params.input-dto';
import { GetAllQuestionsQuery } from '../application/queries/getAll.questions-query';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SaQuizQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('SaQuezQuestionsController created');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllQuestions(
    @Query() query: GetQuestionQueryParams,
  ): Promise<PaginatedViewDto<QuestionSaViewModel[]>> {
    return await this.queryBus.execute(new GetAllQuestionsQuery(query));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Body() dto: QuestionInputModel,
  ): Promise<QuestionSaViewModel> {
    return this.commandBus.execute(
      new CreateQuestionCommand(dto.body, dto.correctAnswers),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionById(
    @Param('id') id: string,
    @Body() dto: QuestionUpdateInputModel,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateQuestionByIdCommand(id, dto.body, dto.correctAnswers),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateStatusPublishquestionById(
    @Param('id') id: string,
    @Body() dto: PublishInputModel,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateQuestionPublishedCommand(id, dto.published),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestions(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
