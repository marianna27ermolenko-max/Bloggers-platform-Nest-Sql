import { Injectable } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  UserLocalDto,
  UserViewSqlDtoAdmin,
} from '../api/view-dto/users.view.sql-dto';
import { CreateUserInputDtoSql } from '../application/usecases/type/user.input-dto';
import { UserDbSqlViewModel, UserRow } from './query/type/type.user';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<UserViewSqlDtoAdmin | null> {
    const users: UserViewSqlDtoAdmin[] = await this.dataSource.query(
      'SELECT id, login, email, created_at  AS "createdAt" FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    const user = users[0];
    if (!user) return null;

    return user;
  }

  async createUserAdmin({ login, email, passwordHash }: CreateUserInputDtoSql) {
    const user: UserDbSqlViewModel[] = await this.dataSource.query(
      'INSERT INTO users (login, email, "passwordHash") VALUES ($1, $2, $3) RETURNING*',
      [login, email, passwordHash],
    );

    const userId = user[0].id;
    await this.dataSource.query(
      'INSERT INTO user_verifications (user_id, "email_confirmation_isConfirmed") VALUES ($1, $2)',
      [userId, true],
    );

    return userId;
  }

  async createUser({
    login,
    email,
    passwordHash,
    confirmationCode,
    expirationDate,
  }: CreateUserInputDtoSql) {
    const user: UserDbSqlViewModel[] = await this.dataSource.query(
      'INSERT INTO users (login, email, "passwordHash") VALUES ($1, $2, $3) RETURNING*',
      [login, email, passwordHash],
    );

    const userId = user[0].id;
    await this.dataSource.query(
      'INSERT INTO user_verifications (user_id, email_confirmation_code, "email_confirmation_expirationDate") VALUES ($1, $2, $3)',
      [userId, confirmationCode, expirationDate],
    );

    return userId;
  }

  async confirmEmail(userId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE user_verifications 
      SET "email_confirmation_isConfirmed" = true, email_confirmation_code = null, 
      "email_confirmation_expirationDate" = null 
      WHERE user_id = $1`,
      [userId],
    );
  }

  async confirmEmailResending(
    id: number,
    confirmationCode: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE user_verifications
      SET email_confirmation_code = $1, "email_confirmation_expirationDate" = $2
      WHERE user_id = $3
      `,
      [confirmationCode, expirationDate, id],
    );
  }

  async confirmEmailCheck(userId: number): Promise<boolean> {
    const result: { email_confirmation_isConfirmed: boolean }[] =
      await this.dataSource.query(
        `SELECT "email_confirmation_isConfirmed" 
      FROM user_verifications 
      WHERE user_id = $1`,
        [userId],
      );

    const check = result[0];

    if (!check) return false;

    return check.email_confirmation_isConfirmed;
  }

  async findOrNotFoundFail(id: number): Promise<UserDbSqlViewModel> {
    const users: UserDbSqlViewModel[] = await this.dataSource.query(
      `SELECT id, login, email, created_at AS "createdAt" 
      FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserLocalDto | null> {
    const users: UserLocalDto[] = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", created_at AS "createdAt" 
      FROM users 
      WHERE login = $1 OR email = $1`,
      [loginOrEmail],
    );
    if (!users[0]) return null;

    return users[0];
  }

  async findForCode(code: string): Promise<UserRow> {
    const users: UserRow[] = await this.dataSource.query(
      `SELECT u.id, u.login, u.email, u.created_at AS "createdAt" 
      FROM users AS u 
      JOIN user_verifications AS uv 
      ON u.id = uv.user_id 
      WHERE uv.email_confirmation_code = $1`,
      [code],
    );

    const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Invalid code', 'code')],
      });
    }

    return user;
  }

  async findForRecoveryCode(recoveryCode: string): Promise<UserRow | null> {
    const users: UserRow[] = await this.dataSource.query(
      `SELECT  u.id, u.login, u.email, u.created_at AS "createdAt" 
      FROM users as u 
      JOIN user_verifications as uv 
      ON u.id = uv.user_id
      WHERE uv.recovery_confirmation_code = $1`,
      [recoveryCode],
    );

    const user = users[0];

    if (!user) {
      return null;
    }

    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await this.dataSource.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }

  async passwordRecovery(
    id: number,
    code: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE user_verifications 
      SET recovery_confirmation_code = $1, "recovery_confirmation_expirationDate" = $2 
      WHERE user_id = $3`,
      [code, expirationDate, id],
    );
  }

  async newPassword(id: number, passwordHash: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE users 
      SET passwordHash = $1
      WHERE id = $2`,
      [passwordHash, id],
    );

    await this.dataSource.query(
      `UPDATE user_verifications 
       SET recovery_confirmation_code = null, "recovery_confirmation_expirationDate" = null 
       WHERE user_id = $1`,
      [id],
    );
  }
}
