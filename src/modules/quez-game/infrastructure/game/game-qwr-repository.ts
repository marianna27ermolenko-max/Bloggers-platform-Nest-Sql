import { Injectable } from '@nestjs/common';
import { Game, GameStatuses } from '../../domain/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../../domain/player.entity';
import { In, Not, Repository } from 'typeorm';
import { GameQuestion } from '../../domain/game-questions.entity';
import { Answer } from '../../domain/answer.entity';
import {
  GameSortBy,
  GetGameQueryParams,
} from '../../api/input-dto/get-myGame-query.params';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';

@Injectable()
export class GameQwrRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepository: Repository<GameQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async findPlayerInCurrentGame(userId: string): Promise<Player | null> {
    return this.playerRepository.findOne({
      where: {
        userId,
        game: {
          status: In([GameStatuses.PendingSecondPlayer, GameStatuses.Active]),
        },
      },
      relations: { game: true, user: true },
    });
  }

  async findOpponent(gameId: string, playerId: string): Promise<Player | null> {
    return this.playerRepository.findOne({
      where: { gameId, id: Not(playerId) },
      relations: { user: true },
    });
  }

  async findGameQuestions(gameId: string): Promise<GameQuestion[]> {
    const questions = await this.gameQuestionRepository.find({
      where: { gameId },
      order: { id: 'ASC' },
      relations: { question: true },
    });

    return questions;
  }

  async findAllGamesQuestions(gameIds: string[]): Promise<GameQuestion[]> {
    const questions = await this.gameQuestionRepository.find({
      where: { gameId: In(gameIds) },
      order: { id: 'ASC' },
      relations: { question: true },
    });

    return questions;
  }

  async findAllAnswersForPlayer(playerId: string): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { playerId },
      order: { createdAt: 'ASC' },
    });
  }

  async findAllAnswersForPlayers(playerIds: string[]): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { playerId: In(playerIds) },
      order: { createdAt: 'ASC' },
    });
  }

  async findGameById(id: string): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { id },
      relations: { players: { user: true }, gameQuestions: { question: true } },
    });
  }

  async findPlayersByGameId(gameIds: string[]): Promise<Player[]> {
    return this.playerRepository.find({
      where: {
        gameId: In(gameIds),
      },
      relations: { user: true },
    });
  }

  async findAllGamesByUserId(
    userId: string,
    query: GetGameQueryParams,
  ): Promise<[Player[], number]> {
    const { pageSize, sortBy } = query;

    const sortDirection =
      query.sortDirection === SortDirection.Desc ? 'DESC' : 'ASC';

    const sortByMap = {
      [GameSortBy.pairCreatedDate]: 'g.createdAt',
      [GameSortBy.status]: 'g.status',
      [GameSortBy.startGameDate]: 'g.startGameDate',
      [GameSortBy.finishGameDate]: 'g.finishGameDate',
    };

    const qb = this.playerRepository
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.user', 'u') //просто подгружает связанные сущности внутрь Player
      .leftJoinAndSelect('pl.game', 'g')
      .where({ userId })
      .orderBy(sortByMap[sortBy], sortDirection)
      .addOrderBy('g.createdAt', 'DESC')
      .skip(query.calculateSkip())
      .take(pageSize);

    console.log(qb.getQueryAndParameters());

    const [players, totalCount] = await qb.getManyAndCount();

    return [players, totalCount];
  }

  async findFinishedGamesAndPlayersByUserId(userId: string): Promise<Player[]> {
    const result = await this.playerRepository.find({
      where: { userId, game: { status: GameStatuses.Finished } },
      relations: { game: { players: true } },
    });

    return result;
  }

  async findGamesAndPlayersByStatus(status: GameStatuses): Promise<Player[]> {
    const result = await this.playerRepository.find({
      where: { game: { status: status } },
      relations: { game: { players: true }, user: true },
    });

    return result;
  }
}
