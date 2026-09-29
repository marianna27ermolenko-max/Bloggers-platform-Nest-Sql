import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GameRepository } from '../../infrastructure/game/game-repository';
import { GameStatuses } from '../../domain/game.entity';
import { DataSource } from 'typeorm';
import { Player } from '../../domain/player.entity';

@Processor('quiz-game')
export class QuizGameProcessor extends WorkerHost {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<{ gameId: string }>): Promise<void> {
    if (job.name !== 'finish-game') {
      return;
    }

    const game = await this.gameRepository.findGame(job.data.gameId);

    if (!game || game.status !== GameStatuses.Active) {
      return;
    }

    const players = await this.gameRepository.findPlayersByGameId(game.id);
    if (players.length !== 2) {
      return;
    }

    const player1 = players[0];
    const player2 = players[1];

    const player1Answers = await this.gameRepository.countAnswersByPlayerId(
      player1.id,
    );

    const player2Answers = await this.gameRepository.countAnswersByPlayerId(
      player2.id,
    );

    const player1Finished = player1Answers === 5;
    const player2Finished = player2Answers === 5;

    let finishedPlayer: Player | null = null;

    if (player1Finished && !player2Finished) {
      finishedPlayer = player1;
    }

    if (player2Finished && !player1Finished) {
      finishedPlayer = player2;
    }

    if (!finishedPlayer) {
      return;
    }

    return this.dataSource.transaction(async (manager) => {
      if (finishedPlayer.score > 0) {
        finishedPlayer.score += 1;

        await this.gameRepository.savePlayer(finishedPlayer, manager);
      }

      game.changeByFinishedStatusGame();
      await this.gameRepository.saveGame(game, manager);
    });
  }
}
