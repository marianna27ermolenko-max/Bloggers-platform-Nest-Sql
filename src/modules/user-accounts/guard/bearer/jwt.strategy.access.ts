import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserContextDto } from '../dto/user-context.dto';
import { Injectable } from '@nestjs/common';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { UsersSqlRepository } from '../../user/infrastructure/users.sql.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private userAccountsConfig: UserAccountsConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.accessTokenSecret,
    });
  }

  /**
   * функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
   * @param payload
   */

  async validate(payload: UserContextDto): Promise<UserContextDto> {
    const user = await this.usersSqlRepository.findById(payload.id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid access token',
      });
    }

    return payload;
  }
}
