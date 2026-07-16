import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { RefreshTokenPayload } from '../type/refreshTokenPayload.type';
import { UsersSqlRepository } from 'src/modules/user-accounts/user/infrastructure/users.sql.repository';
import { SessionsSqlRepository } from 'src/modules/user-accounts/session-devices-security/infrastructure/session-devices.sql.repo';

export class UpdateRefreshToken extends Command<{
  newAccessToken: string;
  newRefreshToken: string;
}> {
  constructor(
    public userId: UserContextDto,
    public refreshToken: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateRefreshToken)
export class UpdateRefreshTokenHandler implements ICommandHandler<
  UpdateRefreshToken,
  {
    newAccessToken: string;
    newRefreshToken: string;
  }
> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private usersSqlRepository: UsersSqlRepository,
    private sessionsSqlRepository: SessionsSqlRepository,
  ) {}

  async execute({ userId, refreshToken }: UpdateRefreshToken): Promise<{
    newAccessToken: string;
    newRefreshToken: string;
  }> {
    const user = await this.usersSqlRepository.findById(userId.id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    const payloadOldRefreshToken =
      await this.refreshTokenContext.verifyAsync<RefreshTokenPayload>(
        refreshToken,
      );

    const session = await this.sessionsSqlRepository.findSessionOrNotFoundFail(
      payloadOldRefreshToken.deviceId,
    );

    if (session.userId !== payloadOldRefreshToken.id) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    if (
      session.lastActiveDate.toISOString() !==
      new Date(payloadOldRefreshToken.iat * 1000).toISOString()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token already used',
      });
    }

    const newAccessToken = await this.accessTokenContext.signAsync({
      id: userId.id,
    });

    const newRefreshToken = await this.refreshTokenContext.signAsync({
      id: userId.id,
      deviceId: payloadOldRefreshToken.deviceId,
    });

    const payloadNewRefreshToken =
      this.refreshTokenContext.decode<RefreshTokenPayload>(newRefreshToken);

    if (!payloadNewRefreshToken) {
      throw new Error('Cannot decode refresh token');
    }

    const lastActiveDate = new Date(
      payloadNewRefreshToken?.iat * 1000,
    ).toISOString();
    const expirationDate = new Date(
      payloadNewRefreshToken?.exp * 1000,
    ).toISOString();

    await this.sessionsSqlRepository.sessionUpdateActivity(
      payloadNewRefreshToken.deviceId,
      lastActiveDate,
      expirationDate,
    );

    return { newAccessToken, newRefreshToken };
  }
}
