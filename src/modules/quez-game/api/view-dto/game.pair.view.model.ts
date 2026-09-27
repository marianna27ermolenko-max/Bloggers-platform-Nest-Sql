import { GamePlayerProgressViewModel } from './game.player.progress.view.model';
import { QuestionViewModel } from './question.view.model';
import { Game } from '../../domain/game.entity';

export enum GameStatuses {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export class GamePairViewModel {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel | null;
  questions: QuestionViewModel[] | null;
  status: GameStatuses;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;

  static viewModel(
    id: string,
    player1: GamePlayerProgressViewModel,
    player2: GamePlayerProgressViewModel | null,
    questions: QuestionViewModel[] | null,
    status: GameStatuses,
    game: Game,
  ): GamePairViewModel {
    const mapModel = new GamePairViewModel();

    mapModel.id = id;
    mapModel.firstPlayerProgress = {
      answers: player1.answers,
      player: player1.player,
      score: player1.score,
    };

    mapModel.secondPlayerProgress = player2
      ? {
          answers: player2.answers,
          player: player2.player,
          score: player2.score,
        }
      : null;

    mapModel.questions = questions;
    mapModel.status = status;
    mapModel.pairCreatedDate = game.createdAt.toISOString();
    mapModel.startGameDate = game.startGameDate?.toISOString() ?? null;
    mapModel.finishGameDate = game.finishGameDate?.toISOString() ?? null;

    return mapModel;
  }
}
