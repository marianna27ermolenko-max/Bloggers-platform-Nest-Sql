import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { UsersRepository } from 'src/modules/user-accounts/user/infrastructure/users.sql.repository';
import { BcryptService } from '../bcrypt.service';
import { EmailService } from 'src/modules/notifications/email.service';
import { User } from 'src/modules/user-accounts/user/domain/user.entity';
import { UserVerification } from 'src/modules/user-accounts/user/domain/user_verifications.entity';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { UserVerificationRepository } from 'src/modules/user-accounts/user/infrastructure/user-verification-repo';

export class RegistrationUserCommand extends Command<void> {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
    super();
  }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserCommandHandler implements ICommandHandler<
  RegistrationUserCommand,
  void
> {
  constructor(
    private userRepository: UsersRepository,
    private userVerificationRepository: UserVerificationRepository,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  async execute({
    login,
    email,
    password,
  }: RegistrationUserCommand): Promise<void> {
    const emailCheck = await this.userRepository.findByLoginOrEmail(email);
    if (emailCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'email')],
      });
    }

    const loginCheck = await this.userRepository.findByLoginOrEmail(login);
    if (loginCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'login')],
      });
    }

    const passwordHash = await this.bcryptService.generationHash(password);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    const user = User.createUser({ login, email, passwordHash });
    await this.userRepository.save(user);

    const userVeri = UserVerification.createVerification(
      user.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      confirmationCode,
      expirationDate,
    );
    await this.userVerificationRepository.save(userVeri);

    await this.emailService
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .sendConfirmationEmail(email, confirmationCode)
      .catch(console.error);
  }
}
