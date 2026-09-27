import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { Player } from '../../domain/player.entity';
import { Game, GameStatuses } from '../../domain/game.entity';
import { GameQuestion } from '../../domain/game-questions.entity';
import { Answer } from '../../domain/answer.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
  ) {}

  //GAME
  async saveGame(game: Game, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(Game)
      : this.gameRepository;

    await repository.save(game);
  }

  async findGame(id: string): Promise<Game | null> {
    return this.gameRepository.findOne({ where: { id } });
  }

  async findGameWaitingForSecondPlayer(): Promise<Game | null> {
    const result = await this.gameRepository.findOne({
      where: { status: GameStatuses.PendingSecondPlayer },
    });

    return result;
  }

  //PLAYER
  async savePlayer(player: Player, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(Player)
      : this.playerRepository;

    await repository.save(player);
  }

  async findFirstPlayer(gameId: string): Promise<Player | null> {
    const player1 = await this.playerRepository.findOne({ where: { gameId } });

    return player1;
  }

  async findPlayer(userId: string): Promise<Player | null> {
    return this.playerRepository.findOne({ where: { userId } });
  }

  async findPlayerInCurrentGame(userId: string): Promise<Player | null> {
    const result = await this.playerRepository.findOne({
      where: {
        userId,
        game: {
          status: In([GameStatuses.PendingSecondPlayer, GameStatuses.Active]),
        },
      },
      relations: {
        game: true,
      },
    });

    return result;
  }

  async findPlayerInActiveGame(userId: string): Promise<Player | null> {
    const result = await this.playerRepository.findOne({
      where: {
        userId,
        game: {
          status: GameStatuses.Active,
        },
      },
      relations: {
        game: true,
      },
    });

    return result;
  }

  async findOpponent(
    gameId: string,
    playerId: string,
    manager?: EntityManager,
  ): Promise<Player> {
    const repository = manager
      ? manager.getRepository(Player)
      : this.playerRepository;

    const player2 = await repository.findOne({
      where: { gameId, id: Not(playerId) },
    });

    if (!player2) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    return player2;
  }

  //GAME_QUESTION
  async saveGameQuestion(
    gameQuestion: GameQuestion,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(GameQuestion)
      : this.gameQuestionRepository;

    await repository.save(gameQuestion);
  }

  async findGameQuestions(gameId: string): Promise<GameQuestion[]> {
    const questions = await this.gameQuestionRepository.find({
      where: { gameId },
      order: { id: 'ASC' },
    });

    return questions;
  }

  //ANSWER
  async saveAnswer(answer: Answer, manager?: EntityManager): Promise<void> {
    const repository = manager
      ? manager.getRepository(Answer)
      : this.answerRepository;

    await repository.save(answer);
  }

  async findAnswer(
    questionId: string,
    playerId: string,
  ): Promise<Answer | null> {
    return this.answerRepository.findOne({ where: { questionId, playerId } });
  }

  async countAnswersByPlayerId(
    playerId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repository = manager
      ? manager.getRepository(Answer)
      : this.answerRepository;

    return await repository.countBy({ playerId });
  }

  async findLastAnswerByPlayerId(
    playerId: string,
    manager?: EntityManager,
  ): Promise<Answer | null> {
    const repository = manager
      ? manager.getRepository(Answer)
      : this.answerRepository;

    return repository.findOne({
      where: { playerId },
      order: { createdAt: 'DESC' },
    });
  }
}
