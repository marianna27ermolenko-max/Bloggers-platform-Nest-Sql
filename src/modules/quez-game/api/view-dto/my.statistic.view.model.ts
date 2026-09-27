export class MyStatisticViewModel {
  sumScore: number; //сумма очков - всех завершенных игр
  avgScores: number; //средний балл по всем завершенным играм - округ. до 2 цифр после запятой
  gamesCount: number; //общее колличество завершенных игр игроком
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static createMyStatisticViewModel(
    sumScore: number,
    avgScores: number,
    gamesCount: number,
    winsCount: number,
    lossesCount: number,
    drawsCount: number,
  ): MyStatisticViewModel {
    const viewModel = new MyStatisticViewModel();

    viewModel.avgScores = avgScores;
    viewModel.drawsCount = drawsCount;
    viewModel.gamesCount = gamesCount;
    viewModel.lossesCount = lossesCount;
    viewModel.sumScore = sumScore;
    viewModel.winsCount = winsCount;

    return viewModel;
  }
}
