import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // или beforeAll
  beforeEach(async () => {
    //создаем сначала модуль тестовый через класс Test с помощью стат. метода createTestingModule импортируем наш AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile(); //компилируем

    //потом через этот модуль создаем наше приложение
    app = moduleFixture.createNestApplication();
    await app.init(); //инициализируем
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
