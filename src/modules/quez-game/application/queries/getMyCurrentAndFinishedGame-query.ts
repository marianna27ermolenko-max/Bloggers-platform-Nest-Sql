import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { GamePairViewModel } from '../../api/view-dto/game.pair.view.model';
import { GetGameQueryParams } from '../../api/input-dto/get-myGame-query.params';
import { UsersExternalQueryRepository } from 'src/modules/user-accounts/user/infrastructure/external-query/users.external-query-repository';
import { GameQwrRepository } from '../../infrastructure/game/game-qwr-repository';
import { Player } from '../../domain/player.entity';
import { Answer } from '../../domain/answer.entity';
import { GameQuestion } from '../../domain/game-questions.entity';
import { AnswerViewModel } from '../../api/view-dto/answer.view.model';
import { GameStatuses } from '../../domain/game.entity';

export class CurrentAndFinishedGameByUserIdQuery extends Query<
  PaginatedViewDto<GamePairViewModel[]>
> {
  constructor(
    public userId: string,
    public query: GetGameQueryParams,
  ) {
    super();
  }
}

@QueryHandler(CurrentAndFinishedGameByUserIdQuery)
export class CurrentAndFinishedGameByUserIdQueryHandler implements IQueryHandler<
  CurrentAndFinishedGameByUserIdQuery,
  PaginatedViewDto<GamePairViewModel>
> {
  constructor(
    private readonly usersRepository: UsersExternalQueryRepository,
    private readonly gameQwrRepository: GameQwrRepository,
  ) {}

  async execute({
    userId,
    query,
  }: CurrentAndFinishedGameByUserIdQuery): Promise<
    PaginatedViewDto<GamePairViewModel[]>
  > {
    await this.usersRepository.getByIdOrNotFoundFail(userId);

    const { pageNumber, pageSize } = query;

    const [players, totalCount] =
      await this.gameQwrRepository.findAllGamesByUserId(userId, query);

    const gamesIds = players.map((pl) => pl.gameId);

    //находим всех игроков + далее создаем коллекцию =  игра(id) + массив игроков
    const playersGames =
      await this.gameQwrRepository.findPlayersByGameId(gamesIds);
    const playersGameIdMap = new Map<string, Player[]>();
    for (const player of playersGames) {
      const playersForGame = playersGameIdMap.get(player.gameId);

      if (playersForGame) {
        playersForGame.push(player);
      } else {
        playersGameIdMap.set(player.gameId, [player]);
      }
    }

    const playerIds = playersGames.map((pl) => pl.id);

    //находим все ответы всех наших игроков + создаем коллекцию = игрок(id) + массив ответов
    const answers =
      await this.gameQwrRepository.findAllAnswersForPlayers(playerIds);
    const answersMap = new Map<string, Answer[]>();
    for (const answer of answers) {
      const answerForPlayer = answersMap.get(answer.playerId);

      if (answerForPlayer) {
        answerForPlayer.push(answer);
      } else {
        answersMap.set(answer.playerId, [answer]);
      }
    }

    //находим все вопросы к нашим играм + создаем коллекцию = игра(id) + вопрос
    const questions =
      await this.gameQwrRepository.findAllGamesQuestions(gamesIds);
    const questionsMap = new Map<string, GameQuestion[]>();
    for (const question of questions) {
      const questionForGame = questionsMap.get(question.gameId);

      if (questionForGame) {
        questionForGame.push(question);
      } else {
        questionsMap.set(question.gameId, [question]);
      }
    }

    //СБОРКА
    const items = players.map((player) => {
      const game = player.game;
      const gameId = player.gameId;

      //статус игры - пендинг
      if (game.status === GameStatuses.PendingSecondPlayer) {
        const questions = null;
        const player2 = null;

        const playerViewModel = {
          answers: [],
          player: { id: player.userId, login: player.user.login },
          score: player.score,
        };

        return GamePairViewModel.viewModel(
          gameId,
          playerViewModel,
          player2,
          questions,
          game.status,
          game,
        );
      }

      const gamePlayers = playersGameIdMap.get(gameId)!;
      const gameQuestions = questionsMap.get(gameId)!;
      const viewModelGameQuestions = gameQuestions.map((q) => {
        return { id: q.questionId, body: q.question.body };
      });

      const sortedPlayer = gamePlayers.toSorted(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      const firstPlayer = sortedPlayer[0];
      const secondPlayer = sortedPlayer[1];

      const answerForFirstPlayer = answersMap.get(firstPlayer.id) ?? [];
      const viewModelAnswerForFirstPlayer = answerForFirstPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const viewModelFirstPlayer = {
        answers: viewModelAnswerForFirstPlayer,
        player: { id: firstPlayer.userId, login: firstPlayer.user.login },
        score: firstPlayer.score,
      };

      const answerForSecondPlayer = answersMap.get(secondPlayer.id) ?? [];
      const viewModelAnswerForSecondPlayer = answerForSecondPlayer.map((a) =>
        AnswerViewModel.mapViewModel(
          a.questionId,
          a.status,
          a.createdAt.toISOString(),
        ),
      );

      const viewModelSecondPlayer = {
        answers: viewModelAnswerForSecondPlayer,
        player: { id: secondPlayer.userId, login: secondPlayer.user.login },
        score: secondPlayer.score,
      };

      return GamePairViewModel.viewModel(
        gameId,
        viewModelFirstPlayer,
        viewModelSecondPlayer,
        viewModelGameQuestions,
        game.status,
        game,
      );
    });

    return PaginatedViewDto.mapToView<GamePairViewModel[]>({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
