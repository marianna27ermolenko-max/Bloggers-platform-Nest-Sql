import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { AnswerViewModel } from 'src/modules/quez-game/api/view-dto/answer.view.model';
import {
  Answer,
  AnswerStatuses,
} from 'src/modules/quez-game/domain/answer.entity';
import { GameStatuses } from 'src/modules/quez-game/domain/game.entity';
import { GameRepository } from 'src/modules/quez-game/infrastructure/game/game-repository';
import { QuestionRepository } from 'src/modules/quez-game/infrastructure/questions/question.repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class CreateAnswersCommand extends Command<AnswerViewModel> {
  constructor(
    public userId: string,
    public answer: string,
  ) {
    super();
  }
}

@CommandHandler(CreateAnswersCommand)
export class CreateAnswersCommandHandler implements ICommandHandler<
  CreateAnswersCommand,
  AnswerViewModel
> {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly usersRepository: UsersExternalQueryRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly dataSource: DataSource,

    @InjectQueue('quiz-game')
    private readonly quizGameQueue: Queue,
  ) {}

  async execute({
    userId,
    answer,
  }: CreateAnswersCommand): Promise<AnswerViewModel> {
    await this.usersRepository.getByIdOrNotFoundFail(userId);

    //находим игрока и игру
    const player = await this.gameRepository.findPlayerInActiveGame(userId);
    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    const game = await this.gameRepository.findGame(player.gameId);
    if (!game || game.status !== GameStatuses.Active) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    //находим массив вопросов и сразу сортируем их
    const gameQuestion = await this.gameRepository.findGameQuestions(game.id);

    //проходимся по нему и сммотрим есть ли ответ на вопрос у этого пользователя - идем последовательно
    for (let i = 0; i < gameQuestion.length; i++) {
      const question = gameQuestion[i];

      const answerForQuestion = await this.gameRepository.findAnswer(
        question.questionId,
        player.id,
      );

      if (!answerForQuestion) {
        const currentQuestion = await this.questionRepository.findQuestion(
          question.questionId,
        );

        if (!currentQuestion) {
          throw new DomainException({
            code: DomainExceptionCode.NotFound,
            message: 'question not found',
          });
        }

        //УПАКРВЫВАЕМ В ТРАНЗАКЦИЮ ЛОГИКУ - СОЗДАНИЕ ОТВЕТА - ПРОВЕРКИ
        const result = await this.dataSource.transaction(async (manager) => {
          const statusAnswer = currentQuestion.correctAnswers.some(
            (correctAnswer) =>
              correctAnswer.toLowerCase() === answer.toLowerCase(),
          )
            ? AnswerStatuses.Correct
            : AnswerStatuses.Incorrect;

          if (statusAnswer === AnswerStatuses.Correct) {
            player.score += 1;
            await this.gameRepository.savePlayer(player, manager);
          }

          const newAnswer = Answer.createAnswer(
            question.questionId,
            player.id,
            statusAnswer,
          );

          await this.gameRepository.saveAnswer(newAnswer, manager);
          const addedAt = newAnswer.createdAt.toISOString();

          //проверяем колличество ответов у обоих игроков - если по 5 - то меняем статус игры
          const numberAnswersPlayer1 =
            await this.gameRepository.countAnswersByPlayerId(
              player.id,
              manager,
            );

          const player2 = await this.gameRepository.findOpponent(
            game.id,
            player.id,
            manager,
          );

          const numberAnswersPlayer2 =
            await this.gameRepository.countAnswersByPlayerId(
              player2.id,
              manager,
            );

          const shouldScheduleFinish =
            numberAnswersPlayer1 === 5 && numberAnswersPlayer2 < 5;

          if (numberAnswersPlayer1 === 5 && numberAnswersPlayer2 === 5) {
            game.changeByFinishedStatusGame();
            await this.gameRepository.saveGame(game, manager);

            //определяем кому начислить балл
            const lastAnswerPlayer2 =
              await this.gameRepository.findLastAnswerByPlayerId(
                player2.id,
                manager,
              );

            if (!lastAnswerPlayer2) {
              throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Forbidden',
              });
            }

            if (
              lastAnswerPlayer2.createdAt > newAnswer.createdAt &&
              player.score > 0
            ) {
              player.score += 1;
              await this.gameRepository.savePlayer(player, manager);
            } else if (
              lastAnswerPlayer2.createdAt < newAnswer.createdAt &&
              player2.score > 0
            ) {
              player2.score += 1;
              await this.gameRepository.savePlayer(player2, manager);
            }
          }

          const answerViewModel = AnswerViewModel.mapViewModel(
            question.questionId,
            statusAnswer,
            addedAt,
          );

          return { answerViewModel, shouldScheduleFinish, gameId: game.id };
        });

        if (result.shouldScheduleFinish) {
          await this.quizGameQueue.add(
            'finish-game',
            { gameId: result.gameId },
            { delay: 10_000 },
          );
        }

        return result.answerViewModel;
      }
    }

    //а если везде есть есть ответы - то надо выбросить ошибку - 403
    throw new DomainException({
      code: DomainExceptionCode.Forbidden,
      message: 'Forbidden',
    });
  }
}
