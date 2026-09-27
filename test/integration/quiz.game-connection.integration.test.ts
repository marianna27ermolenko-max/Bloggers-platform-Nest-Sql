import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { GameStatuses } from 'src/modules/quez-game/api/view-dto/game.pair.view.model';
import { ConnectionGameCommand } from 'src/modules/quez-game/application/usecases/game/create-connection.game.usecase';
import { Game } from 'src/modules/quez-game/domain/game.entity';
import { Player } from 'src/modules/quez-game/domain/player.entity';
import { appSetup } from 'src/setup/app.setup';
import { createTestUser } from 'test/helpers/createUser.forIntegrationTest.helper';
import { DataSource } from 'typeorm';

describe('QUIZ_GAME', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let commandBus: CommandBus;

  const validInputDtoUser = {
    login: 'Marianna888',
    email: 'marianna_dro@mail.ru',
    password: 'string111',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        //ЕСЛИ БУДЕМ ИСПОЛЬЗОВАТЬ ТЕСТОВУЮ БД
        // TypeOrmModule.forRoot({
        //   type: 'postgres',
        //   host: 'localhost',
        //   port: Number(process.env.SQL_PORT) || 5432,
        //   username: process.env.SQL_USERNAME,
        //   password: process.env.SQL_PASSWORD,
        //   database: process.env.SQL_NAME_DATABES,
        //   autoLoadEntities: true,
        //   synchronize: false,
        //   logging: true,
        // }),

        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app, false);
    await app.init();

    dataSource = app.get(DataSource);
    commandBus = app.get(CommandBus);
  });

  beforeEach(async () => {
    await dataSource.query(`
    TRUNCATE
      "user",
      "user_verification",
      "session",
      "answer",
      "game_question",
      "player",
      "game",
      "question"
    RESTART IDENTITY CASCADE
  `);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Connection game', () => {
    it('should create pending game for first player', async () => {
      const userId = await createTestUser(
        commandBus,
        validInputDtoUser.login,
        validInputDtoUser.email,
        validInputDtoUser.password,
      );

      const connection = await commandBus.execute(
        new ConnectionGameCommand(userId),
      );

      expect(connection.status).toBe(GameStatuses.PendingSecondPlayer);
      expect(connection.questions).toBeNull();
      expect(connection.secondPlayerProgress).toBeNull();
      expect(connection.firstPlayerProgress.player.id).toBe(userId);
      expect(connection.firstPlayerProgress.score).toBe(0);

      const player = await dataSource
        .getRepository(Player)
        .findOne({ where: { userId } });
      expect(player).not.toBeNull();
      expect(player?.userId).toBe(userId);
      expect(player?.score).toBe(0);

      const game = await dataSource
        .getRepository(Game)
        .findOne({ where: { id: connection.id } });
      expect(game).not.toBeNull();
      expect(game?.status).toBe(GameStatuses.PendingSecondPlayer);
      expect(game?.startGameDate).toBeNull();
    });
  });
});
