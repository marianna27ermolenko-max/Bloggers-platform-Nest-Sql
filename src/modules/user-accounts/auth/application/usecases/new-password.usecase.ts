import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserVerificationRepository } from 'src/modules/user-accounts/user/infrastructure/user-verification-repo';
import { UsersRepository } from 'src/modules/user-accounts/user/infrastructure/users.sql.repository';
import { BcryptService } from '../bcrypt.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class NewPasswordCommand extends Command<void> {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {
    super();
  }
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordCommandHandler implements ICommandHandler<
  NewPasswordCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private userVerificationRepository: UserVerificationRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: NewPasswordCommand): Promise<void> {
    const userVerification =
      await this.usersRepository.findForRecoveryCode(recoveryCode);

    const user = await this.usersRepository.findById(userVerification.userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Invalid recovery code',
      });
    }

    const passwordHash = await this.bcryptService.generationHash(newPassword);
    user.updatePasswordHash(passwordHash);
    await this.usersRepository.save(user);

    userVerification.confirmRecovery();
    await this.userVerificationRepository.save(userVerification);
  }
}
