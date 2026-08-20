import { Repository } from 'typeorm';
import { UserVerification } from '../domain/user_verifications.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class UserVerificationRepository {
  constructor(
    @InjectRepository(UserVerification)
    private usersVerificationRepo: Repository<UserVerification>,
  ) {}

  async save(user: UserVerification): Promise<void> {
    await this.usersVerificationRepo.save(user);
  }

  async findByUserId(userId: string): Promise<UserVerification | null> {
    return await this.usersVerificationRepo.findOne({
      where: { userId },
    });
  }

  async findByEmailConfirmationCode(code: string): Promise<UserVerification> {
    const user = await this.usersVerificationRepo.findOne({
      where: { emailConfirmationCode: code },
    });

    // const users: UserRow[] = await this.dataSource.query(
    //   `SELECT u.id, u.login, u.email, u.created_at AS "createdAt"
    //     FROM users AS u
    //     JOIN user_verifications AS uv
    //     ON u.id = uv.user_id
    //     WHERE uv.email_confirmation_code = $1`,
    //   [code],
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
}
