import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user-accounts/user/dto/create-user.dto';
import request from 'supertest';

//использую в ауз - логин и регистрации
export const createUser = async (
  app: INestApplication,
  dto: CreateUserDto,
  expectedStatus: HttpStatus = HttpStatus.CREATED,
): Promise<IUserView> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const res = await request(app.getHttpServer())
    .post(`/sa/users`)
    .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
    .send(dto)
    .expect(expectedStatus);
  return res.body;
};

export const registrationUser = async (
  app: INestApplication,
  dto: CreateUserDto,
  expectedStatus: HttpStatus = HttpStatus.NO_CONTENT,
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await request(app.getHttpServer())
    .post(`/auth/registration`)
    .send(dto)
    .expect(expectedStatus);
};
