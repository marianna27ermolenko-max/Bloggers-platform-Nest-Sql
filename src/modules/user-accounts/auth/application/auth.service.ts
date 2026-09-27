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
