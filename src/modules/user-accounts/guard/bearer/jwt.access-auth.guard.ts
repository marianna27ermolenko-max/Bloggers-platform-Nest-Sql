import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser = UserContextDto>(err: any, user: any): TUser {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    return user as TUser;
  }
}
