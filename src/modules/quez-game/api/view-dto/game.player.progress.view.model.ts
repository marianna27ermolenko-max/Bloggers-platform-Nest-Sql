import { AnswerViewModel } from './answer.view.model';
import { PlayerViewModel } from './player.view.model';

export class GamePlayerProgressViewModel {
  answers: AnswerViewModel[] = [];
  player: PlayerViewModel;
  score: number = 0;
}
