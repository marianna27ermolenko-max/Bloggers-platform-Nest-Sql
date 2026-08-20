import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user-accounts/user/dto/create-user.dto';
import request from 'supertest';
import { UsersTestHelper } from './test.users.helper';

export const registerAndConfirmUser = async (
  app: INestApplication,
  dto: CreateUserDto,
  userHelper: UsersTestHelper,
) => {
  const user = await userHelper.createUser(dto);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await request(app.getHttpServer())
    .post(`/auth/registration-confirmation`)
    .send({ code: user.emailConfirmation.confirmationCode })
    .expect(HttpStatus.NO_CONTENT);
};
