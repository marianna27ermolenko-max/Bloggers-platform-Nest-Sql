import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  GamePairViewModel,
  GameStatuses,
} from '../../../api/view-dto/game.pair.view.model';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { GameRepository } from 'src/modules/quez-game/infrastructure/game/game-repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { QuestionRepository } from 'src/modules/quez-game/infrastructure/questions/question.repository';
import { Player } from 'src/modules/quez-game/domain/player.entity';
import { GameQuestion } from 'src/modules/quez-game/domain/game-questions.entity';
import { DataSource } from 'typeorm';
import { Game } from 'src/modules/quez-game/domain/game.entity';

export class ConnectionGameCommand extends Command<GamePairViewModel> {
  constructor(public id: string) {
    super();
  }
}

@CommandHandler(ConnectionGameCommand)
export class ConnectionGameCommandHandler implements ICommandHandler<
  ConnectionGameCommand,
  GamePairViewModel
> {
  constructor(
    private readonly usersRepository: UsersExternalQueryRepository,
    private readonly gameRepository: GameRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute({ id }: ConnectionGameCommand): Promise<GamePairViewModel> {
    const user = await this.usersRepository.getByIdOrNotFoundFail(id);

    //проверяем не сущ-т ли у юзера активная игра - то есть игра = active или pendingsecondPlayer
    const checkCurrentGame =
      await this.gameRepository.findPlayerInCurrentGame(id);
    if (checkCurrentGame) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User is already participating in active pair',
      });
    }

    //потом смотрим есть ли где-то уже игра в состоянии = pendingsecondPlayer - и если есть добавляемся как второй игрок
    const game = await this.gameRepository.findGameWaitingForSecondPlayer();

    //1 ВАРИАНТ - ИГРА УЖЕ ЕСТЬ - В СОСТОЯНИИ ОЖИДАНИЯ ВТОРОГО ИГРОКА
    if (game) {
      const firstPlayer = await this.gameRepository.findFirstPlayer(game.id);
      const loginFirstPlayer = await this.usersRepository.getByIdOrNotFoundFail(
        firstPlayer!.userId,
      );

      const player1ViewModel = {
        answers: [],
        player: { id: firstPlayer!.userId, login: loginFirstPlayer.login },
        score: 0,
      };

      //берем в транзакцию //НАПИСАТЬ ВЛАДУ ПО ТРАНЗАКЦИХ!!!!!!!!!!!!!!!!!!!
      return this.dataSource.transaction(async (manager) => {
        const createPlayer2 = Player.createPlayer(id, game.id);
        // await manager.save(createPlayer2); - как альтернативный вариант
        await this.gameRepository.savePlayer(createPlayer2, manager); //чтобы оставить арх. стиль - в репо в этом методе надот добавить - manager.getRepository(...)

        const player2ViewModel = {
          answers: [],
          player: { id, login: user.login },
          score: 0,
        };

        const status = GameStatuses.Active;
        game.changeStatusGame(status);
        await this.gameRepository.saveGame(game, manager);

        //когда добавился второй игрок - выбираем рандомно вопросы для пары
        const questionsRandom =
          await this.questionRepository.findRandomFiveQuestions(manager);

        if (questionsRandom.length < 5) {
          throw new DomainException({
            code: DomainExceptionCode.InternalServerError,
            message: 'insufficient number of questions',
          });
        }

        for (const q of questionsRandom) {
          const instance = GameQuestion.createGameQuestion(game.id, q.id);
          await this.gameRepository.saveGameQuestion(instance, manager);
        }

        const questionsViewModel = questionsRandom.map((q) => {
          return { id: q.id, body: q.body };
        });

        return GamePairViewModel.viewModel(
          game.id,
          player1ViewModel,
          player2ViewModel,
          questionsViewModel,
          status,
          game,
        );
      });
    }

    //2 ВАРИАНТ - ИГРЫ НЕТ - В СТАТУСЕ ОЖИДАНИЯ
    return this.dataSource.transaction(async (manager) => {
      const status = GameStatuses.PendingSecondPlayer;
      const newGame = Game.createGame(status, null);
      await this.gameRepository.saveGame(newGame, manager);

      const player1 = Player.createPlayer(id, newGame.id);
      await this.gameRepository.savePlayer(player1, manager);

      const player1ViewModel = {
        answers: [],
        player: { id, login: user.login },
        score: 0,
      };

      const player2 = null;
      const questions = null;

      return GamePairViewModel.viewModel(
        newGame.id,
        player1ViewModel,
        player2,
        questions,
        status,
        newGame,
      );
    });
  }
}
