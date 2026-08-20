import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/modules/user-accounts/user/infrastructure/users.sql.repository';
import { add } from 'date-fns';
import { UserVerificationRepository } from 'src/modules/user-accounts/user/infrastructure/user-verification-repo';
import { EmailService } from 'src/modules/notifications/email.service';

export class PasswordRecoveryCommand extends Command<void> {
  constructor(public email: string) {
    super();
  }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryCommandHandler implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private userVerificationRepository: UserVerificationRepository,
    private emailService: EmailService,
  ) {}

  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (user) {
      const userVerification =
        await this.userVerificationRepository.findByUserId(user.id);
      if (userVerification) {
        const code = crypto.randomUUID();
        const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

        userVerification.updateRecoveryCode(code, expirationDate);
        await this.userVerificationRepository.save(userVerification);

        await this.emailService

          .sendConfirmationEmail(email, code)
          .catch(console.error);
      }
    }
  }
}
