import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from './bcrypt.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EmailService } from 'src/modules/notifications/email.service';
import { NewPasswordInputDto } from '../../auth/api/input-dto/new.passwort.input.dto';
import { UserContextDtoSql } from '../../guard/dto/user-context.dto';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { add } from 'date-fns';
import { User, type UserModelType } from '../../user/domain/user.entity';
import { UsersSqlRepository } from '../../user/infrastructure/users.sql.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private readonly usersSqlRepository: UsersSqlRepository,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  async registration(dto: CreateUserDto): Promise<void> {
    const emailCheck = await this.usersSqlRepository.findByLoginOrEmail(
      dto.email,
    );

    if (emailCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already exists', 'email')],
      });
    }

    const loginCheck = await this.usersSqlRepository.findByLoginOrEmail(
      dto.login,
    );
    if (loginCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Login already exists', 'login')],
      });
    }

    const login = dto.login;
    const email = dto.email;
    const passwordHash = await this.bcryptService.generationHash(dto.password);
    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    await this.usersSqlRepository.createUser({
      login,
      email,
      passwordHash,
      confirmationCode,
      expirationDate,
    });

    await this.emailService
      .sendConfirmationEmail(email, confirmationCode)
      .catch(console.error);
  }

  async registrationConfirmation(code: string): Promise<void> {
    const user = await this.usersSqlRepository.findForCode(code);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Invalid code', 'code')],
      });
    }
    const userId = user.id;
    await this.usersSqlRepository.confirmEmail(userId);
  }

  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersSqlRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('User not found', 'email')],
      });
    }

    const userId = user.id;
    const confirmCheck =
      await this.usersSqlRepository.confirmEmailCheck(userId);

    if (confirmCheck) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [new Extension('Email already confirmed', 'email')],
      });
    }

    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

    await this.usersSqlRepository.confirmEmailResending(
      userId,
      confirmationCode,
      expirationDate,
    );

    await this.emailService
      .sendConfirmationEmail(user.email, confirmationCode)
      .catch(console.error);
  }

  //перенесли в юзкэйс
  // async login(userId: string): Promise<{ accessToken: string }> {
  //   const accessToken = await this.jwtService.signAsync({
  //     id: userId,
  //   });

  //   return { accessToken };
  // }

  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersSqlRepository.findByLoginOrEmail(email);
    if (user) {
      const userId = user.id;
      const code = uuidv4();
      const expirationDate = add(new Date(), { hours: 1, minutes: 30 });

      await this.usersSqlRepository.passwordRecovery(
        userId,
        code,
        expirationDate,
      );

      await this.emailService
        .sendConfirmationEmail(email, code)
        .catch(console.error);
    }
  }

  async newPassword(dto: NewPasswordInputDto): Promise<void> {
    const user = await this.usersSqlRepository.findForRecoveryCode(
      dto.recoveryCode,
    );

    if (!user) {
      throw new BadRequestException('Invalid recovery code');
    }

    const userId = user.id;
    const passwordHash = await this.bcryptService.generationHash(
      dto.newPassword,
    );

    await this.usersSqlRepository.newPassword(userId, passwordHash);
  }

  async validatedUser(
    login: string,
    password: string,
  ): Promise<UserContextDtoSql | null> {
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
