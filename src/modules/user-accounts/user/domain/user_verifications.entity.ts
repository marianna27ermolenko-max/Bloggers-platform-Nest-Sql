import { BaseDBEntity } from '../../../../core/BaseDBEntity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Entity()
export class UserVerification extends BaseDBEntity {
  @Column({ type: 'varchar', default: null, nullable: true })
  emailConfirmationCode: string | null;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  emailConfirmationExpirationDate: Date | null;

  @Column({ type: 'boolean', default: false })
  emailConfirmationIsConfirmed: boolean;

  @Column({ type: 'varchar', default: null, nullable: true })
  recoveryConfirmationCode: string | null;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  recoveryConfirmationExpirationDate: Date | null;

  @Column({ type: 'varchar', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.userVerification, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  static createVerification(
    userId: string,
    code: string,
    expirationDate: Date,
  ): UserVerification {
    const userVerification = new UserVerification();
    userVerification.userId = userId;
    userVerification.emailConfirmationCode = code;
    userVerification.emailConfirmationExpirationDate = expirationDate;

    return userVerification;
  }

  static createVerificationAdmin(userId: string): UserVerification {
    const userVerification = new UserVerification();
    userVerification.userId = userId;
    userVerification.emailConfirmationIsConfirmed = true;
    return userVerification;
  }

  confirmEmail(): void {
    const expirationDate = this.emailConfirmationExpirationDate;

    if (!expirationDate || expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Expired code', 'code')],
      });
    }

    if (this.emailConfirmationIsConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Email already confirmed', 'code')],
      });
    }

    this.emailConfirmationCode = null;
    this.emailConfirmationExpirationDate = null;
    this.emailConfirmationIsConfirmed = true;
  }

  resendConfirmationCode(code: string, expirationDate: Date): void {
    if (this.emailConfirmationIsConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Email already confirmed', 'email')],
      });
    }

    this.emailConfirmationCode = code;
    this.emailConfirmationExpirationDate = expirationDate;
  }

  updateRecoveryCode(code: string, expirationDate: Date): void {
    this.recoveryConfirmationCode = code;
    this.recoveryConfirmationExpirationDate = expirationDate;
  }

  confirmRecovery(): void {
    if (!this.recoveryConfirmationCode) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Invalid recovery code', 'code')],
      });
    }

    const expirationDate = this.recoveryConfirmationExpirationDate;

    if (!expirationDate || expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: [new Extension('Expired code', 'code')],
      });
    }

    this.recoveryConfirmationCode = null;
    this.recoveryConfirmationExpirationDate = null;
  }
}
