import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenPayload } from '../type/refreshTokenPayload.type';
import { SessionsRepository } from 'src/modules/user-accounts/session-devices-security/infrastructure/session-devices.sql.repo';
import { Session } from 'src/modules/user-accounts/session-devices-security/domain/session.entity';

export class LoginUserCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public userId: string,
    public userAgent: string = 'unknown',
    public ip: string,
  ) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler implements ICommandHandler<
  LoginUserCommand,
  { accessToken: string; refreshToken: string }
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private sessionsSqlRepository: SessionsRepository,
  ) {}

  async execute({
    userId,
    userAgent,
    ip,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.accessTokenContext.signAsync({
      id: userId,
    });

    const deviceId = crypto.randomUUID();

    const refreshToken = await this.refreshTokenContext.signAsync({
      id: userId,
      deviceId,
    });

    const payload =
      await this.refreshTokenContext.verifyAsync<RefreshTokenPayload>(
        refreshToken,
      );

    const lastActiveDate = new Date(payload.iat * 1000);
    const expirationDate = new Date(payload.exp * 1000);

    const session = Session.createSession(
      deviceId,
      userId,
      userAgent,
      ip,
      lastActiveDate,
      expirationDate,
    );

    await this.sessionsSqlRepository.save(session);

    return { accessToken, refreshToken };
  }
}
