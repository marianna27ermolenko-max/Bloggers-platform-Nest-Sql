import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../infrastructure/users.sql.repository';
import { BcryptService } from 'src/modules/user-accounts/auth/application/bcrypt.service';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class CreateUserCommand extends Command<number> {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<
  CreateUserCommand,
  number
> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    login,
    email,
    password,
  }: CreateUserCommand): Promise<number> {
    const emailCheck = await this.usersSqlRepository.findByLoginOrEmail(email);
    if (emailCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'email')],
      });
    }

    const loginCheck = await this.usersSqlRepository.findByLoginOrEmail(login);
    if (loginCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Login already exists', 'login')],
      });
    }
    const passwordHash = await this.bcryptService.generationHash(password);
    const userId = await this.usersSqlRepository.createUserAdmin({
      login,
      email,
      passwordHash,
    });

    return userId;
  }
}
