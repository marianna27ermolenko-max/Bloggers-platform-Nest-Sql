import { BaseDBEntity } from 'src/core/BaseDBEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Player } from './player.entity';
import { GameQuestion } from './game-questions.entity';

export enum GameStatuses {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity()
export class Game extends BaseDBEntity {
  @Column({
    type: 'enum',
    enum: GameStatuses,
    default: GameStatuses.PendingSecondPlayer,
  })
  status: GameStatuses;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  startGameDate: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  finishGameDate: Date | null;

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  gameQuestions: GameQuestion[];

  static createGame(status: GameStatuses, startGameDate: Date | null): Game {
    const game = new Game();

    game.status = status;
    game.startGameDate = startGameDate;

    return game;
  }

  changeStatusGame(status: GameStatuses): void {
    this.status = status;
    this.startGameDate = new Date();
  }

  changeByFinishedStatusGame(): void {
    this.status = GameStatuses.Finished;
    this.finishGameDate = new Date();
  }
}
