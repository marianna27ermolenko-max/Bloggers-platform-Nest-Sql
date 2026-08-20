import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.sql.repository';
import { BcryptService } from 'src/modules/user-accounts/auth/application/bcrypt.service';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { User } from '../../domain/user.entity';
import { UserVerification } from '../../domain/user_verifications.entity';
import { UserVerificationRepository } from '../../infrastructure/user-verification-repo';

export class CreateUserCommand extends Command<string> {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
    super();
  }
}

//создание юзера через админа
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersVerificationRepo: UserVerificationRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    login,
    email,
    password,
  }: CreateUserCommand): Promise<string> {
    const emailCheck = await this.usersRepository.findByLoginOrEmail(email);
    if (emailCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'email')],
      });
    }

    const loginCheck = await this.usersRepository.findByLoginOrEmail(login);
    if (loginCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Login already exists', 'login')],
      });
    }
    const passwordHash = await this.bcryptService.generationHash(password);

    const user = User.createUser({ login, email, passwordHash });
    await this.usersRepository.save(user);
    const userVerification = UserVerification.createVerificationAdmin(user.id);
    await this.usersVerificationRepo.save(userVerification);

    return user.id;
  }
}
