import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../user/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from './bcrypt.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from 'src/modules/notifications/email.service';
import { NewPasswordInputDto } from '../../auth/api/input-dto/new.passwort.input.dto';
import { UserContextDto } from '../../guard/dto/user-context.dto';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { add } from 'date-fns';
import { User, type UserModelType } from '../../user/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  async registration(dto: CreateUserDto): Promise<void> {
    const email = await this.usersRepository.findByLoginOrEmail(dto.email);
    if (email) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'email')],
      });
    }

    const login = await this.usersRepository.findByLoginOrEmail(dto.login);
    if (login) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Login already exists', 'login')],
      });
    }

    const passwordHash = await this.bcryptService.generationHash(dto.password);
    const confirmationCode = 'uuid';
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
      confirmationCode,
      expirationDate,
    });

    await this.usersRepository.save(user);

    await this.emailService
      .sendConfirmationEmail(user.email, confirmationCode)
      .catch(console.error);
  }

  async registrationConfirmation(code: string): Promise<void> {
    const user = await this.usersRepository.findForCode(code);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Invalid code', 'code')],
      });
    }
    user.confirmEmail();
    await this.usersRepository.save(user);
  }

  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('User not found', 'email')],
      });
    }

    const confirmationCode = 'uuid1';
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    user.confirmEmailResending(confirmationCode, expirationDate);

    await this.usersRepository.save(user);

    await this.emailService
      .sendConfirmationEmail(user.email, confirmationCode)
      .catch(console.error);
  }

  // async login(userId: string): Promise<{ accessToken: string }> {
  //   const accessToken = await this.jwtService.signAsync({
  //     id: userId,
  //   });

  //   return { accessToken };
  // }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (user) {
      const code = 'uuid1';
      const expirationDate = add(new Date(), { hours: 1, minutes: 30 });
      user.passwordRecovery(code, expirationDate);
      await this.usersRepository.save(user);

      await this.emailService
        .sendConfirmationEmail(user.email, code)
        .catch(console.error);
    }
  }

  async newPassword(dto: NewPasswordInputDto): Promise<void> {
    const user = await this.usersRepository.findForRecoveryCode(
      dto.recoveryCode,
    );

    if (!user) {
      throw new BadRequestException('Invalid recovery code');
    }

    const passwordHash = await this.bcryptService.generationHash(
      dto.newPassword,
    );

    user.updatePassword(passwordHash);

    await this.usersRepository.save(user);
  }

  async validatedUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(login);
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

    return { id: user._id.toString() };
  }
}
