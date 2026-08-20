import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appSetup } from 'src/setup/app.setup';
import { AppModule } from 'src/app.module';
import request from 'supertest';

export const getAppAndClearDb = () => {
  let app: INestApplication;
  //создаем пользователя, чтобы потом его не дублировать
  //   let createdUserId: string;

  beforeAll(async () => {
    //это билдер
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: Number(process.env.SQL_PORT) || 5432,
          username: process.env.SQL_USERNAME,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_NAME_DATABES,
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        }),

        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app, false);
    await app.init();

    // Create a user for testing

    //     const userResponse = await request(app.getHttpServer())
    //       .post('sa/users')
    //       .auth('admin', 'qwerty')
    //       .send({ name: 'Test User', email: 'test@example.com', isActive: true });

    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    //     createdUserId = userResponse.body.id;
  });

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer()).delete(`testing/all-data`).expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
};
