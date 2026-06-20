import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtRefreshPayload } from '../../bearer/type/refreshToken.payload';

export const ExtractRefreshPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtRefreshPayload => {
    const request = context.switchToHttp().getRequest<
      Request & {
        user: JwtRefreshPayload;
      }
    >();

    const payload = request.user;

    if (!payload) {
      throw new UnauthorizedException(
        'There is no refresh payload in request object',
      );
    }

    return payload;
  },
);
