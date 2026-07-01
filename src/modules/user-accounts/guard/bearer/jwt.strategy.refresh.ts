import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { JwtRefreshPayload } from './type/refreshToken.payload';
import { Request } from 'express';
import { UsersSqlRepository } from '../../user/infrastructure/users.sql.repository';
import { SessionsSqlRepository } from '../../session-devices-security/infrastructure/session-devices.sql.repo';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private userAccountsConfig: UserAccountsConfig,
    private sessionsSqlRepository: SessionsSqlRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (req: Request) => req?.cookies?.refreshToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
   * @param payload
   */

  async validate(payload: JwtRefreshPayload): Promise<JwtRefreshPayload> {
    const user = await this.usersSqlRepository.findById(payload.id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid refresh token',
      });
    }

    const session = await this.sessionsSqlRepository.findSession(
      payload.deviceId,
    );

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid refresh token',
      });
    }

    if (session.userId !== payload.id) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    if (
      session.lastActiveDate.toISOString() !==
      new Date(payload.iat * 1000).toISOString()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token already used',
      });
    }

    return payload;
  }
}
