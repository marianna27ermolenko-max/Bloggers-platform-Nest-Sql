import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenPayload } from '../type/refreshTokenPayload.type';
import { SessionsSqlRepository } from 'src/modules/user-accounts/session-devices-security/infrastructure/session-devices.sql.repo';

export class LoginUserCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public dto: { userId: number },
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

    private sessionsSqlRepository: SessionsSqlRepository,
  ) {}

  async execute({
    dto,
    userAgent,
    ip,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.accessTokenContext.signAsync({
      id: dto.userId,
    });

    const deviceId = uuidv4();

    const refreshToken = await this.refreshTokenContext.signAsync({
      id: dto.userId,
      deviceId,
    });

    const payload =
      await this.refreshTokenContext.verifyAsync<RefreshTokenPayload>(
        refreshToken,
      );

    const lastActiveDate = new Date(payload?.iat * 1000).toISOString();
    const expirationDate = new Date(payload?.exp * 1000).toISOString();

    await this.sessionsSqlRepository.createSession({
      userId: dto.userId,
      deviceId,
      userAgent,
      ip,
      lastActiveDate,
      expirationDate,
    });

    return { accessToken, refreshToken };
  }
}
