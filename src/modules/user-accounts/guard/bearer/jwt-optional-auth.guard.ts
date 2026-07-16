/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//тот случай когда надо проверить токен и извлечь данные из токена, но не блокировать запрос для анонимного пользователя
//для этого можно использовать подобный гард, переопределив handleRequest

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    //super.handleRequest(err, user, info, context, status);
    // мы не будем вызывать здесь базовый метод суперкласса, в нём написано вот это:
    // кидаем ошибку если нет юзера или если другая ошибка (например JWT протух)...
    // handleRequest(err, user, info, context, status) {
    //   if (err || !user) {
    //     throw err || new common_1.UnauthorizedException();
    //   }
    //   return user;
    // }
    // а мы вернём просто null и не будем процессить ошибку и null

    if (err || !user) {
      return null;
    } else {
      return user;
    }
  }
}
