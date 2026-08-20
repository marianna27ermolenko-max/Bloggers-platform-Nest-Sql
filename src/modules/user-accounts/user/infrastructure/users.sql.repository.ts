import { Injectable } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserDbSqlViewModel } from './query/type/type.user';
import { User } from '../domain/user.entity';
import { UserVerification } from '../domain/user_verifications.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserVerification)
    private userVerificationRepo: Repository<UserVerification>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) return null;
    return user;
  }

  async findOrNotFoundFail(id: string): Promise<UserDbSqlViewModel> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'user not found',
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    return user;
  }

  //перенесли метод в юзерверификатион репозиторий
  // async findForCode(code: string): Promise<UserRow> {
  //   const userI = await this.userVerificationRepo.fi

  //   const users: UserRow[] = await this.dataSource.query(
  //     `SELECT u.id, u.login, u.email, u.created_at AS "createdAt"
  //     FROM users AS u
  //     JOIN user_verifications AS uv
  //     ON u.id = uv.user_id
  //     WHERE uv.email_confirmation_code = $1`,
  //     [code],
  //   );

  //   const user = users[0];

  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.ValidationError,
  //       message: 'Validation failed',
  //       extensions: [new Extension('Invalid code', 'code')],
  //     });
  //   }

  //   return user;
  // }

  async findForRecoveryCode(recoveryCode: string): Promise<UserVerification> {
    const user = await this.userVerificationRepo.findOne({
      where: { recoveryConfirmationCode: recoveryCode },
    });

    // const users: UserRow[] = await this.dataSource.query(
    //   `SELECT  u.id, u.login, u.email, u.created_at AS "createdAt"
    //   FROM users as u
    //   JOIN user_verifications as uv
    //   ON u.id = uv.user_id
    //   WHERE uv.recovery_confirmation_code = $1`,
    //   [recoveryCode],
    // );
    // const user = users[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Invalid code', 'code')],
      });
    }

    return user;
  }

  async softDeleteUser(id: string): Promise<void> {
    await this.usersRepo.softDelete(id);

    // await this.dataSource.query(
    //   'UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    //   [id],
    // );
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
