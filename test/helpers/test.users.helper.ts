import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { BcryptService } from 'src/modules/user-accounts/auth/application/bcrypt.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export type RegisterUserResultType = {
  id: string;
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
  };

  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: Date | null;
    isConfirmed: boolean;
  };

  recoveryCode: {
    confirmationCode: string | null;
    expirationDate: Date | null;
  };
};

type RegisterUserPayloadType = {
  login: string;
  email: string;
  password: string;
  code?: string;
  expirationDate?: Date;
  isConfirmed?: boolean;
  expirationDateRec?: string;
  expirationDateRes?: Date;
};

//подготовка днных для тестов
export const testSeederUserDTO = {
  createUserDto() {
    return {
      login: 'testing',
      email: 'test@gmail.com',
      password: '123456789',
    };
  },

  createUserDtos(count: number) {
    const users: {
      login;
      email;
      password;
    }[] = [];

    for (let i = 0; i < count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
    }

    return users;
  },
};

//метод который возвращает целый созданный обьект обьект
export class UsersTestHelper {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {}

  async createUser({
    login,
    email,
    password,
    code,
    expirationDate,
    isConfirmed,
    expirationDateRec,
    expirationDateRes,
  }: RegisterUserPayloadType): Promise<RegisterUserResultType> {
    const passwordHash = await this.bcryptService.generationHash(password);

    const confirmationCode = code ?? randomUUID();

    const confirmationExpirationDate =
      expirationDate ??
      add(new Date(), {
        hours: 1,
        minutes: 30,
      });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.dataSource.query(
      'INSERT INTO users (login, email, "passwordHash") VALUES ($1, $2, $3) RETURNING*',
      [login, email, passwordHash],
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user[0].id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const createdUser = user[0];

    await this.dataSource.query(
      'INSERT INTO user_verifications (user_id, email_confirmation_code, "email_confirmation_expirationDate") VALUES ($1, $2, $3)',
      [userId, confirmationCode, confirmationExpirationDate],
    );

    const newUser = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: userId,
      accountData: {
        login,
        email,
        passwordHash,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        createdAt: createdUser.createdAt,
      },
      emailConfirmation: {
        confirmationCode,
        expirationDate: confirmationExpirationDate,
        isConfirmed: isConfirmed ?? false,
      },
      recoveryCode: {
        confirmationCode: expirationDateRec ?? null,
        expirationDate: expirationDateRes ?? null,
      },
    };

    return newUser;
  }
}
