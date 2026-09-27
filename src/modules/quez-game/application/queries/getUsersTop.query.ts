import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { UsersTopViewModel } from '../../api/view-dto/users.top.view.model';
import { GetUsersTopInputModel } from '../../api/input-dto/get-users-top.input-dto';
import { GameQwrRepository } from '../../infrastructure/game/game-qwr-repository';
import { GameStatuses } from '../../domain/game.entity';
import { Player } from '../../domain/player.entity';

export class GetUsersTopQuery extends Query<
  PaginatedViewDto<UsersTopViewModel[]>
> {
  constructor(public query: GetUsersTopInputModel) {
    super();
  }
}

@QueryHandler(GetUsersTopQuery)
export class GetUsersTopQueryHandler implements IQueryHandler<
  GetUsersTopQuery,
  PaginatedViewDto<UsersTopViewModel[]>
> {
  constructor(private readonly gameQwrRepository: GameQwrRepository) {}

  async execute({
    query,
  }: GetUsersTopQuery): Promise<PaginatedViewDto<UsersTopViewModel[]>> {
    const allFinishedGames =
      await this.gameQwrRepository.findGamesAndPlayersByStatus(
        GameStatuses.Finished,
      );

    const playersMap = new Map<string, Player[]>();

    for (const player of allFinishedGames) {
      const playerForMap = playersMap.get(player.userId);

      if (playerForMap) {
        playerForMap.push(player);
      } else {
        playersMap.set(player.userId, [player]);
      }
    }

    const items: UsersTopViewModel[] = [];

    //считаем у каждого пользователя баллы - пользуюмя коллекцией пользователь + табл. где он был игроком
    for (const [userId, userPlayers] of playersMap) {
      const sumScore = userPlayers.reduce((sum, player) => {
        return sum + player.score;
      }, 0);

      const gamesCount = userPlayers.length;

      const avg = sumScore / gamesCount;
      const avgScores = Number(avg.toFixed(2));

      let winsCount = 0;
      let lossesCount = 0;
      let drawsCount = 0;

      for (const player of userPlayers) {
        const players = player.game.players;
        const opponent = players.find((pl) => pl.id !== player.id)!;

        if (player.score > opponent.score) {
          winsCount += 1;
        } else if (player.score < opponent.score) {
          lossesCount += 1;
        } else {
          drawsCount += 1;
        }
      }

      const playerViewModel = {
        id: userId,
        login: userPlayers[0].user.login,
      };

      const item = UsersTopViewModel.createUsersTopViewModel(
        sumScore,
        avgScores,
        gamesCount,
        winsCount,
        lossesCount,
        drawsCount,
        playerViewModel,
      );

      items.push(item);
    }

    const sortParams = query.getSortParams();

    //наша сортировка
    items.sort((a, b) => {
      for (const { field, direction } of sortParams) {
        const aValue = a[field];
        const bValue = b[field];

        if (aValue === bValue) {
          continue;
        }

        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    const totalCount = items.length;

    const startIndex = query.calculateSkip();
    const paginatedItems = items.slice(startIndex, startIndex + query.pageSize);

    return PaginatedViewDto.mapToView<UsersTopViewModel[]>({
      items: paginatedItems,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
