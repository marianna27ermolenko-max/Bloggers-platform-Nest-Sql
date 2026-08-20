// import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AppModule } from 'src/app.module';
// import { DataSource } from 'typeorm';
// import request from 'supertest';

// describe('AUTH_FLOW_TEST', () => {
//   let app: INestApplication;
//   let dataSource: DataSource;
//   //создаем пользователя, чтобы потом его не дублировать
//   let createdUserId: string;

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [
//       TypeOrmModul.forRoot({
//         type: 'postgres',
//         host: 'localhost',
//         port: Number(process.env.SQL_PORT) || 5432,
//         username: process.env.SQL_USERNAME,
//         password: process.env.SQL_PASSWORD,
//         database: process.env.SQL_NAME_DATABES,
//         autoLoadEntities: true,
//         synchronize: true,
//         logging: true}),
//      AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     appSetup(app);
//     await app.init();

//     // Create a user for testing
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//     const userResponse = await request(app.getHttpServer())
//       .post('sa/users')
//       .auth('admin', 'qwerty')
//       .send({ name: 'Test User', email: 'test@example.com', isActive: true });

//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//     createdUserId = userResponse.body.id;
//   });

//   beforeEach(async () => {
//      return request (app.getHttpServer())
//      .delete(`testing/all-data`)
//      .expect(204)
//     })

//   afterAll(async () => {
//     await app.close();
//   });
// const InvalidDtoUser = {
//   login: '',
//   password: '',
//   email: 'wrong email',
// };

// const validDtoCreateUser = {
//   login: 'admin_7',
//   password: 'Passw0rd!',
//   email: 'admin.test@mail.ru',
// };
//   it('', async () => {});
// });
