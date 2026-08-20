import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { appSetup } from 'src/setup/app.setup';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { createUser } from 'test/helpers/createUser.helper';
import { testSeederUserDTO, UsersTestHelper } from 'test/helpers/test.users.helper';

describe('AUTH_TEST', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app, false);
    await app.init();
  });

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer()).delete(`testing/all-data`).expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  const InvalidDtoUser = {
    login: '',
    password: '',
    email: 'wrong email',
  };

  const validDtoCreateUser = {
    login: 'admin_7',
    password: 'Passw0rd!',
    email: 'admin.test@mail.ru',
  };

  const emailServiceMock = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(true),
  };

  describe('POST /login', () => {
    describe('validation', () => {
      it('should not try login user to the system through invalid login: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: InvalidDtoUser.login,
            password: InvalidDtoUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not try login user to the system through invalid email: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: InvalidDtoUser.email,
            password: InvalidDtoUser.password,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });
    });

    describe('success (200)', () => {
      it('should try registration user to the system through login and get AccsesToken: STATUS 200', async () => {
        await createUser(app, validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('accessToken');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(typeof res.body.accessToken).toBe('string');

        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();

        if (!Array.isArray(cookies)) {
          throw new Error('set-cookie is not an array');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(
          true,
        );
      });

      it('should try login user to the system through email and get AccsesToken: STATUS 200', async () => {
        await createUser(app, validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: validDtoCreateUser.email,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.OK);

        expect(res.body).toHaveProperty('accessToken');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(typeof res.body.accessToken).toBe('string');
      });
    });

    describe('authentication (401)', () => {
      it('should not login with non-existing email: STATUS 401', async () => {
        await createUser(app, validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'wrong@mail.com',
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not login with non-existing login: STATUS 401', async () => {
        await createUser(app, validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: 'wrongLogin',
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not login with wrong password: STATUS 401', async () => {
        await createUser(app, validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: 'wrong password',
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not login without email confirm: STATUS 401', async () => {
        await testSeederUserDTO.insertUser(validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/login`)
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.UNAUTHORIZED);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.errorsMessages?.[0].message).toBe('Email not confirm');
      });
    });

    describe('status 429', () => {
      it('should not login user if custom rate limit more than 5 times: STATUS 429', async () => {
        await registerAndConfirmUser(app, validDtoCreateUser);

        for (let i = 0; i < 5; i++) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await request(app.getHttpServer())
            .post(`/auth/login`)
            .set('X-Forwarded-For', '1.1.1.1')
            .set('User-Agent', 'device')
            .send({
              loginOrEmail: validDtoCreateUser.login,
              password: validDtoCreateUser.password,
            })
            .expect(HttpStatus.OK);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/login`)
          .set('X-Forwarded-For', '1.1.1.1')
          .set('User-Agent', 'device')
          .send({
            loginOrEmail: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
          })
          .expect(HttpStatus.TOO_MANY_REQUESTS);
      });
    });
  });

  describe('POST /registration', () => {
    describe('validation', () => {
      it('should not try login user to the system through invalid login: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration`)
          .send({
            login: InvalidDtoUser.login,
            password: validDtoCreateUser.password,
            email: validDtoCreateUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not try login user to the system through invalid email: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration`)
          .send({
            login: validDtoCreateUser.login,
            password: validDtoCreateUser.password,
            email: InvalidDtoUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not try login user to the system through invalid password: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration`)
          .send({
            login: validDtoCreateUser.login,
            password: InvalidDtoUser.password,
            email: validDtoCreateUser.email,
          })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });
    });

    it('should register user with correct data: STATUS 204', async () => {
      await registrationUser(app, validDtoCreateUser);
    });

    it('should not register user twice: STATUS 400', async () => {
      await registrationUser(app, validDtoCreateUser);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res = await request(app.getHttpServer())
        .post(`/auth/registration`)
        .send(validDtoCreateUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('errorsMessages');
    });
  });

  describe('POST /registration-confirmation', () => {
    it('validation', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res = await request(app.getHttpServer())
        .post(`/auth/registration-confirmation`)
        .send({ code: '' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('errorsMessages');
    });

    describe('STATUS 400', () => {
      it('should not account activated with expired code', async () => {
        const time = new Date(Date.now() - 1000);
        const user = await testSeederUserDTO.insertUser({
          login: 'admin_7',
          password: 'Passw0rd!',
          email: 'admin.test@mail.ru',
          expirationDate: time,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-confirmation`)
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not account activated with already active email', async () => {
        const user = await testSeederUserDTO.insertUser({
          login: 'admin_7',
          password: 'Passw0rd!',
          email: 'admin.test@mail.ru',
          isConfirmed: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-confirmation`)
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not activate account if user does not exist', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-confirmation`)
          .send({ code: 'gdhfjikd2518shsks98v' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });
    });

    describe('STATUS 204', () => {
      it('should account activated with valid code and email', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/registration-confirmation`)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          .send({ code: user.emailConfirmation.confirmationCode })
          .expect(HttpStatus.NO_CONTENT);
      });
    });
  });

  describe('POST /registration-email-resending', () => {
    describe('STATUS 400', () => {
      it('should not active user with not valid email: STATUS 400', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-email-resending`)
          .send({ email: '' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not activate account if user does not exist', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-email-resending`)
          .send({ email: 'hello@mail.ruu' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });

      it('should not account activated with already active email', async () => {
        const user = await this.UsersTestHelper.({
          login: 'admin_7',
          password: 'Passw0rd!',
          email: 'admin.test@mail.ru',
          isConfirmed: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const res = await request(app.getHttpServer())
          .post(`/auth/registration-email-resending`)
          .send({ email: user.accountData.email })
          .expect(HttpStatus.BAD_REQUEST);

        expect(res.body).toHaveProperty('errorsMessages');
      });
    });
    describe('STATUS 204', () => {
      it('STATUS 204', async () => {
        await registrationUser(app, validDtoCreateUser);

        await request(app)
          .post(`/auth/registration-email-resending`)
          .send({ email: validDtoCreateUser.email })
          .expect(HttpStatus.NO_CONTENT);
      });
    });
  });

  describe('POST /refresh-token', () => {
    describe('STATUS 200', () => {
      it('should update tokens with active refreshToken', async () => {
        const { refreshToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const result = await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.OK);

        expect(result.body).toHaveProperty('accessToken');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(typeof result.body.accessToken).toBe('string');

        const newCookies = result.headers['set-cookie'];
        expect(newCookies).toBeDefined();
        if (!Array.isArray(newCookies)) {
          throw new Error('set-cookie is not an array');
        }
        expect(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          newCookies.some((cookie) => cookie.includes('refreshToken')),
        ).toBe(true);
      });
    });

    describe('STATUS 401', () => {
      it('should not update tokens if refreshToken not be in cookies', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [])
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("should not update tokens if lastActiveDate session doesn't match with iat refresh token", async () => {
        //переписать тест - поменялись условия
        await registerAndConfirmUser(app, validDtoCreateUser);
        const device1 = await loginAndGetTokens(
          app,
          validDtoCreateUser,
          'device-1',
          '1.1.1.1',
        );
        const { refreshToken } = device1;

        await sessionsRepo.updateLastActiveDate(
          device1.deviceId,
          '2000-01-01T00:00:00.000Z',
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not update tokens if user not exist', async () => {
        const { refreshToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );
        const user = await usersRepo.findByEmail(validDtoCreateUser.email);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`${USERS_PATH}/${user?.id}`)
          .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
          .expect(HttpStatus.NO_CONTENT);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not update tokens if refresh token is expired', async () => {
        const { refreshToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );
        await new Promise((res) => setTimeout(res, 21000));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.UNAUTHORIZED);
      }, 30000);
    });
  });

  describe('POST /logout', () => {
    describe('STATUS 204', () => {
      it('should will be revoked with correct refresh token', async () => {
        const { refreshToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/logout`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.NO_CONTENT);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshToken}`])
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('STATUS 401', () => {
      it('should not revoked if have not refresh token', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/logout`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not revoke with invalid refresh token', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/refresh-token`)
          .set('Cookie', [`refreshToken=invalid_token`])
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /me', () => {
    describe('STATUS 200', () => {
      it('should get information about current user', async () => {
        const { accessToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const result = await request(app.getHttpServer())
          .get(`/auth/me`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK);

        expect(result.body.email).toBe(validDtoCreateUser.email);
        expect(result.body.login).toBe(validDtoCreateUser.login);
        expect(result.body.userId).toBeDefined();
      });
    });

    describe('STATUS 401', () => {
      it('should return 401 if access token is missing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/auth/me`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return 401 if access token is invalid', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/auth/me`)
          .set('authorization', `Bearer invalid_token`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not get information if user not exist', async () => {
        const { accessToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );
        const user = await usersRepo.findByEmail(validDtoCreateUser.email);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .delete(`${USERS_PATH}/${user?._id}`)
          .auth(ADMIN_USERNAME, ADMIN_PASSWORD)
          .expect(HttpStatus.NO_CONTENT);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/auth/me`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should not get information if access token expired', async () => {
        const { accessToken } = await fullCreateUserWithToken(
          app,
          validDtoCreateUser,
        );

        await new Promise((res) => setTimeout(res, 11000)); // ждем истечения времени жизни токена

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .get(`/auth/me`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.UNAUTHORIZED);
      }, 20000);
    });
  });

  describe('POST /password-recovery', () => {
    describe('STATUS 204', () => {
      it('should confirm password recovery', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);
        await request(app)
          .post(`/auth/password-recovery`)
          .send({ email: user.accountData.email })
          .expect(HttpStatus.NO_CONTENT);
      });

      it('should confirm password recovery if email not found', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/password-recovery`)
          .send({ email: validDtoCreateUser.email })
          .expect(HttpStatus.NO_CONTENT);
      });
    });

    describe('STATUS 400', () => {
      it('should not get code if the inputModel has invalid email', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/password-recovery`)
          .send({ email: InvalidDtoUser.email })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('STATUS 429', () => {
      it('should not get code more than 5 attempts from one IP-address during 10 seconds', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        for (let i = 0; i < 5; i++) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await request(app.getHttpServer())
            .post(`/auth/password-recovery`)
            .send({ email: user.accountData.email })
            .expect(HttpStatus.NO_CONTENT);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/password-recovery`)
          .send({ email: user.accountData.email })
          .expect(HttpStatus.TOO_MANY_REQUESTS);
      });
    });
  });

  describe('POST /new-password', () => {
    describe('STATUS 204', () => {
      it('should update new password with current recovery code', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/password-recovery`)
          .send({ email: user.accountData.email })
          .expect(HttpStatus.NO_CONTENT);

        const updatedUser = await UserModel.findOne({ _id: user.id });
        const recoveryCode = updatedUser!.recoveryCode!.confirmationCode!;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/new-password`)
          .send({ newPassword: 'string145', recoveryCode: recoveryCode })
          .expect(HttpStatus.NO_CONTENT);
      });
    });

    describe('STATUS 400', () => {
      it('should not update new password for incorrect password length', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/new-password`)
          .send({
            newPassword: 'str',
            recoveryCode: user.recoveryCode.confirmationCode,
          })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not update new password recoveryCode is incorrect', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/new-password`)
          .send({ newPassword: 'strigbb', recoveryCode: 'gpopopo159' })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should not update new password recoveryCode is expired', async () => {
        const user = await testSeederUserDTO.insertUser(validDtoCreateUser);

        const expiredCode = '159852354dhghfg753';
        const expiredDate = new Date(Date.now() - 1000 * 60 * 60);

        const update = await UserModel.updateOne(
          { _id: user.id },
          {
            $set: {
              'recoveryCode.confirmationCode': expiredCode,
              'recoveryCode.expirationDate': expiredDate,
            },
          },
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app.getHttpServer())
          .post(`/auth/new-password`)
          .send({ newPassword: 'strigbb', recoveryCode: expiredCode })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
