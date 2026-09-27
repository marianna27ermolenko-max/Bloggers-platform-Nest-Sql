import { PlayerViewModel } from './player.view.model';

export class UsersTopViewModel {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: PlayerViewModel;

  static createUsersTopViewModel(
    sumScore: number,
    avgScores: number,
    gamesCount: number,
    winsCount: number,
    lossesCount: number,
    drawsCount: number,
    player: PlayerViewModel,
  ): UsersTopViewModel {
    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
      player,
    };
  }
}
