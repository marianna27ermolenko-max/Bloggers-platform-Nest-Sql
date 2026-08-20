import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { UserVerificationRepository } from 'src/modules/user-accounts/user/infrastructure/user-verification-repo';
import { UsersRepository } from 'src/modules/user-accounts/user/infrastructure/users.sql.repository';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/modules/notifications/email.service';

export class RegistrationEmailResendingCommand extends Command<void> {
  constructor(public email: string) {
    super();
  }
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingCommandHandler implements ICommandHandler<
  RegistrationEmailResendingCommand,
  void
> {
  constructor(
    private userRepository: UsersRepository,
    private userVerificationRepository: UserVerificationRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.userRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('User not found', 'email')],
      });
    }

    const userVerification = await this.userVerificationRepository.findByUserId(
      user.id,
    );
    if (!userVerification) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('User not found', 'email')],
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    userVerification.resendConfirmationCode(confirmationCode, expirationDate);
    await this.userVerificationRepository.save(userVerification);

    await this.emailService
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .sendConfirmationEmail(user.email, confirmationCode)
      .catch(console.error);
  }
}
