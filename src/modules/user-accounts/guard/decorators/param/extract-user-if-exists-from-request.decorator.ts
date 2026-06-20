import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { Request } from 'express';

//как для optional middleware
export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDto | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UserContextDto }>();

    const user = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
