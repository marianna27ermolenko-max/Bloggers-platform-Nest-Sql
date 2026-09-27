import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewModel } from '../../api/view-dto/game.pair.view.model';
import { GameQwrRepository } from '../../infrastructure/game/game-qwr-repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { AnswerViewModel } from '../../api/view-dto/answer.view.model';
import { GameStatuses } from '../../domain/game.entity';
import { Player } from '../../domain/player.entity';

export class GetMyCurrentGameQuery extends Query<GamePairViewModel> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(GetMyCurrentGameQuery)
export class GetMyCurrentGameQueryHandler implements IQueryHandler<
  GetMyCurrentGameQuery,
  GamePairViewModel
> {
  constructor(private readonly gameQwrRepository: GameQwrRepository) {}

  async execute({ userId }: GetMyCurrentGameQuery): Promise<GamePairViewModel> {
    const player = await this.gameQwrRepository.findPlayerInCurrentGame(userId);
    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game Not Found',
      });
    }

    const gameId = player.gameId;
    const game = player.game;

    let firstPlayer: Player;
    let secondPlayer: Player;

    //проверяем статус игры - если активная - опр кто первый, а кто второй игрок - собираем вью модель
    if (player.game.status === GameStatuses.Active) {
      const player2 = await this.gameQwrRepository.findOpponent(
        gameId,
        player.id,
      );

      if (!player2) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Game Not Found',
        });
      }

      //опред. очередность игроков
      if (player.createdAt < player2.createdAt) {
        firstPlayer = player;
        secondPlayer = player2;
      } else {
        firstPlayer = player2;
        secondPlayer = player;
      }

      const answersFirstPlayer =
        await this.gameQwrRepository.findAllAnswersForPlayer(firstPlayer.id);

      const answersViewModelFirstPlayer = answersFirstPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const firstPlayerViewModel = {
        answers: answersViewModelFirstPlayer,
        player: { id: firstPlayer.userId, login: firstPlayer.user.login },
        score: firstPlayer.score,
      };

      const answersSecondPlayer =
        await this.gameQwrRepository.findAllAnswersForPlayer(secondPlayer.id);

      const answersViewModelSecondPlayer = answersSecondPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const secondPlayerViewModel = {
        answers: answersViewModelSecondPlayer,
        player: { id: secondPlayer.userId, login: secondPlayer.user.login },
        score: secondPlayer.score,
      };

      const questionsGame =
        await this.gameQwrRepository.findGameQuestions(gameId);
      const questions = questionsGame.map((q) => {
        return { id: q.questionId, body: q.question.body };
      });

      return GamePairViewModel.viewModel(
        gameId,
        firstPlayerViewModel,
        secondPlayerViewModel,
        questions,
        game.status,
        game,
      );
    }

    //статус игры - пендинг - собираем вью-модель для первго игрока
    const answersPlayer1 = await this.gameQwrRepository.findAllAnswersForPlayer(
      player.id,
    );

    const answersViewModelPlayer1 = answersPlayer1.map((a) =>
      AnswerViewModel.mapViewModel(
        a.questionId,
        a.status,
        a.createdAt.toISOString(),
      ),
    );

    const player1ViewModel = {
      answers: answersViewModelPlayer1,
      player: { id: player.userId, login: player.user.login },
      score: player.score,
    };

    const player2 = null;
    const questions = null;
    const status = game.status;

    return GamePairViewModel.viewModel(
      gameId,
      player1ViewModel,
      player2,
      questions,
      status,
      game,
    );
  }
}
