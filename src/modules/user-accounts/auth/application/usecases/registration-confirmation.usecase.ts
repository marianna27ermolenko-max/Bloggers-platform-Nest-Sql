import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserVerificationRepository } from 'src/modules/user-accounts/user/infrastructure/user-verification-repo';

export class RegistrationConfirmationCommand extends Command<void> {
  constructor(public code: string) {
    super();
  }
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationCommandHandler implements ICommandHandler<
  RegistrationConfirmationCommand,
  void
> {
  constructor(private userVerificationRepository: UserVerificationRepository) {}

  async execute({ code }: RegistrationConfirmationCommand): Promise<void> {
    const userVerification =
      await this.userVerificationRepository.findByEmailConfirmationCode(code);

    userVerification.confirmEmail();
    await this.userVerificationRepository.save(userVerification);
  }
}
