import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { MyStatisticViewModel } from '../../api/view-dto/my.statistic.view.model';
import { GameQwrRepository } from '../../infrastructure/game/game-qwr-repository';

export class MyStatisticQuery extends Query<MyStatisticViewModel> {
  constructor(public userId: string) {
    super();
  }
}

@QueryHandler(MyStatisticQuery)
export class MyStatisticQueryHandler implements IQueryHandler<
  MyStatisticQuery,
  MyStatisticViewModel
> {
  constructor(private readonly gameQwrRepository: GameQwrRepository) {}

  async execute({ userId }: MyStatisticQuery): Promise<MyStatisticViewModel> {
    const allFinisedGames =
      await this.gameQwrRepository.findFinishedGamesAndPlayersByUserId(userId);

    if (allFinisedGames.length === 0) {
      return MyStatisticViewModel.createMyStatisticViewModel(0, 0, 0, 0, 0, 0);
    }

    //сумма всех очков
    const sumScore = allFinisedGames.reduce((sum, player) => {
      return sum + player.score;
    }, 0);

    //колличество завершн. игр
    const gamesCount = allFinisedGames.length;

    //среднее очки/игры
    const avg = sumScore / gamesCount;
    const avgScores = Number(avg.toFixed(2));

    //считаем игры - результат - !!!! ЧТОБЫ НЕ ВЫСЧИТЫВАТЬ ПО БД - МОЖЕМ ДОБАТЬ ЛОГИКУ - В СУЩ. ПЛЭУЕР ДОБ. ПОЛЕ - СТАТУС (win/losses/draws) - И УЖЕ СЧИТАТЬ УЧИТЫВАЯ ЭТИ СТАТУСЫ
    let winsCount = 0;
    let lossesCount = 0;
    let drawsCount = 0;

    for (const player of allFinisedGames) {
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

    return MyStatisticViewModel.createMyStatisticViewModel(
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    );
  }
}
