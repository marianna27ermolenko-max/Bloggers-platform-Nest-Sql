import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { GamePairViewModel } from '../../api/view-dto/game.pair.view.model';
import { GameQwrRepository } from '../../infrastructure/game/game-qwr-repository';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { GameStatuses } from '../../domain/game.entity';
import { AnswerViewModel } from '../../api/view-dto/answer.view.model';

export class GetGamesByIdQuery extends Query<GamePairViewModel> {
  constructor(
    public gameId: string,
    public userId: string,
  ) {
    super();
  }
}

@QueryHandler(GetGamesByIdQuery)
export class GetGamesByIdQueryHandler implements IQueryHandler<
  GetGamesByIdQuery,
  GamePairViewModel
> {
  constructor(
    private readonly gameQwrRepository: GameQwrRepository,
    private readonly userRepository: UsersExternalQueryRepository,
  ) {}

  async execute({
    gameId,
    userId,
  }: GetGamesByIdQuery): Promise<GamePairViewModel> {
    await this.userRepository.getByIdOrNotFoundFail(userId);

    const game = await this.gameQwrRepository.findGameById(gameId);
    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game Not Found',
      });
    }

    const checkPlayer = game.players.some((player) => player.userId === userId);
    if (!checkPlayer) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    if (
      game.status === GameStatuses.Active ||
      game.status === GameStatuses.Finished
    ) {
      const players = game.players;
      const sortedPlayers = players.toSorted(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const firstPlayer = sortedPlayers[0];
      const secondPlayer = sortedPlayers[1];

      const answersFirstPlayer =
        await this.gameQwrRepository.findAllAnswersForPlayer(firstPlayer.id);
      const answerViewModelFirstPlayer = answersFirstPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const viewModelFirstPlayer = {
        answers: answerViewModelFirstPlayer,
        player: { id: firstPlayer.userId, login: firstPlayer.user.login },
        score: firstPlayer.score,
      };

      const answersSecondPlayer =
        await this.gameQwrRepository.findAllAnswersForPlayer(secondPlayer.id);
      const answerViewModelSecondPlayer = answersSecondPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const viewModelSecondPlayer = {
        answers: answerViewModelSecondPlayer,
        player: { id: secondPlayer.userId, login: secondPlayer.user.login },
        score: secondPlayer.score,
      };

      const questionsGame = await this.gameQwrRepository.findGameQuestions(
        game.id,
      );

      const viewModelquestions = questionsGame.map((q) => {
        return { id: q.questionId, body: q.question.body };
      });

      return GamePairViewModel.viewModel(
        gameId,
        viewModelFirstPlayer,
        viewModelSecondPlayer,
        viewModelquestions,
        game.status,
        game,
      );
    }

    const player = game.players[0];
    const answersPlayer = await this.gameQwrRepository.findAllAnswersForPlayer(
      player.id,
    );
    const answerViewModelPlayer = answersPlayer.map((a) =>
      AnswerViewModel.mapViewModel(
        a.questionId,
        a.status,
        a.createdAt.toISOString(),
      ),
    );

    const viewModelFirstPlayer = {
      answers: answerViewModelPlayer,
      player: { id: player.userId, login: player.user.login },
      score: player.score,
    };

    const secondPlayer = null;
    const questions = null;

    return GamePairViewModel.viewModel(
      game.id,
      viewModelFirstPlayer,
      secondPlayer,
      questions,
      game.status,
      game,
    );
  }
}
