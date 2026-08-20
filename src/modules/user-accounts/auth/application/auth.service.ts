import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from './bcrypt.service';
import { EmailService } from 'src/modules/notifications/email.service';
import { UserContextDto } from '../../guard/dto/user-context.dto';
import { UsersRepository } from '../../user/infrastructure/users.sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersSqlRepository: UsersRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  //перенесли в юз кейс
  // async registration(dto: CreateUserDto): Promise<void> {
  //   const emailCheck = await this.usersSqlRepository.findByLoginOrEmail(
  //     dto.email,
  //   );

  //   if (emailCheck) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Validation failed',
  //       extensions: [new Extension('Email already exists', 'email')],
  //     });
  //   }

  //   const loginCheck = await this.usersSqlRepository.findByLoginOrEmail(
  //     dto.login,
  //   );
  //   if (loginCheck) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Validation failed',
  //       extensions: [new Extension('Login already exists', 'login')],
  //     });
  //   }

  //   const login = dto.login;
  //   const email = dto.email;
  //   const passwordHash = await this.bcryptService.generationHash(dto.password);
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  //   const confirmationCode = uuidv4();
  //   const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

  //   await this.usersSqlRepository.createUser({
  //     login,
  //     email,
  //     passwordHash,
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     confirmationCode,
  //     expirationDate,
  //   });

  //   await this.emailService
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //     .sendConfirmationEmail(email, confirmationCode)
  //     .catch(console.error);
  // }

  //перенесли в юз кейс
  // async registrationConfirmation(code: string): Promise<void> {
  //   const user = await this.usersSqlRepository.findForCode(code);
  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Validation failed',
  //       extensions: [new Extension('Invalid code', 'code')],
  //     });
  //   }
  //   const userId = user.id;
  //   await this.usersSqlRepository.confirmEmail(userId);
  // }

  // async registrationEmailResending(email: string): Promise<void> {
  //   const user = await this.usersSqlRepository.findByLoginOrEmail(email);
  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Validation failed',
  //       extensions: [new Extension('User not found', 'email')],
  //     });
  //   }

  //   const userId = user.id;
  //   const confirmCheck =
  //     await this.usersSqlRepository.confirmEmailCheck(userId);

  //   if (confirmCheck) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Validation failed',
  //       extensions: [new Extension('Email already confirmed', 'email')],
  //     });
  //   }

  //   const confirmationCode = uuidv4();
  //   const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

  //   await this.usersSqlRepository.confirmEmailResending(
  //     userId,
  //     confirmationCode,
  //     expirationDate,
  //   );

  //   await this.emailService
  //     .sendConfirmationEmail(user.email, confirmationCode)
  //     .catch(console.error);
  // }

  //перенесли в юзкэйс
  // async login(userId: string): Promise<{ accessToken: string }> {
  //   const accessToken = await this.jwtService.signAsync({
  //     id: userId,
  //   });

  //   return { accessToken };
  // }

  // async passwordRecovery(email: string): Promise<void> {
  //   const user = await this.usersSqlRepository.findByLoginOrEmail(email);
  //   if (user) {
  //     const userId = user.id;
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  //     const code = uuidv4();
  //     const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

  //     await this.usersSqlRepository.passwordRecovery(
  //       userId,
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //       code,
  //       expirationDate,
  //     );

  //     await this.emailService
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //       .sendConfirmationEmail(email, code)
  //       .catch(console.error);
  //   }
  // }

  // async newPassword(dto: NewPasswordInputDto): Promise<void> {
  //   const user = await this.usersSqlRepository.findForRecoveryCode(
  //     dto.recoveryCode,
  //   );

  //   if (!user) {
  //     throw new BadRequestException('Invalid recovery code');
  //   }

  //   const userId = user.id;
  //   const passwordHash = await this.bcryptService.generationHash(
  //     dto.newPassword,
  //   );

  //   await this.usersSqlRepository.newPassword(userId, passwordHash);
  // }

  async validatedUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersSqlRepository.findByLoginOrEmail(login);
    if (!user) {
      return null;
    }

    const checkPassword = await this.bcryptService.checkPassword(
      password,
      user.passwordHash,
    );

    if (!checkPassword) {
      return null;
    }

    return { id: user.id };
  }
}
