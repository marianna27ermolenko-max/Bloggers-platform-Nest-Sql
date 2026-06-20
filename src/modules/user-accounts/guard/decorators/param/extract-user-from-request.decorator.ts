import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { Request } from 'express';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto => {
    const request = context.switchToHttp().getRequest<
      Request & {
        user: UserContextDto;
      }
    >();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('There is no user in request object');
    }

    return user;
  },
);
