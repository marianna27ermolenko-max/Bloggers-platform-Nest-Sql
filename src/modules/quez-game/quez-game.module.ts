import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quez-game.controller';
import { SaQuizQuestionsController } from './api/sa.quez-game.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { Answer } from './domain/answer.entity';
import { Game } from './domain/game.entity';
import { Player } from './domain/player.entity';
import { CreateQuestionCommandHandler } from './application/usecases/create-question.usecase';
import { QuestionRepository } from './infrastructure/questions/question.repository';
import { UpdateQuestionByIdCommandHandler } from './application/usecases/update-question.usecase';
import { UpdateQuestionPublishedCommandHandler } from './application/usecases/updatePublish-question.usecase';
import { DeleteQuestionCommandHandler } from './application/usecases/delete-question.usecase';
import { GetAllQuestionsQueryHandler } from './application/queries/getAll.questions-query';
import { QuestionQwrRepository } from './infrastructure/questions/question-qwr.repository';
import { ConnectionGameCommandHandler } from './application/usecases/game/create-connection.game.usecase';
import { CreateAnswersCommandHandler } from './application/usecases/game/create-answer.usecase';
import { GameQuestion } from './domain/game-questions.entity';
import { GameRepository } from './infrastructure/game/game-repository';
import { GetMyCurrentGameQueryHandler } from './application/queries/getMyCurrent-game.query';
import { GameQwrRepository } from './infrastructure/game/game-qwr-repository';
import { GetGamesByIdQueryHandler } from './application/queries/geGame.by.id-query';
import { CurrentAndFinishedGameByUserIdQueryHandler } from './application/queries/getMyCurrentAndFinishedGame-query';
import { MyStatisticQueryHandler } from './application/queries/getMyStatistic.query';
import { GetUsersTopQueryHandler } from './application/queries/getUsersTop.query';
import { BullModule } from '@nestjs/bullmq';
import { QuizGameProcessor } from './application/processors/quiz.processor';

const commands = [
  CreateQuestionCommandHandler,
  UpdateQuestionByIdCommandHandler,
  UpdateQuestionPublishedCommandHandler,
  DeleteQuestionCommandHandler,
  ConnectionGameCommandHandler,
  CreateAnswersCommandHandler,
];

const queries = [
  GetAllQuestionsQueryHandler,
  GetMyCurrentGameQueryHandler,
  GetGamesByIdQueryHandler,
  CurrentAndFinishedGameByUserIdQueryHandler,
  MyStatisticQueryHandler,
  GetUsersTopQueryHandler,
];
const repository = [
  QuestionRepository,
  QuestionQwrRepository,
  GameRepository,
  GameQwrRepository,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([Question, Answer, Game, Player, GameQuestion]),
    BullModule.registerQueue({ name: 'quiz-game' }),
  ], //или здесь не надо уже энтити регистрировать, так как есть миграции
  controllers: [QuizGameController, SaQuizQuestionsController],
  providers: [...repository, ...commands, ...queries, QuizGameProcessor],
  exports: [],
})
export class QuezGameModule {}
