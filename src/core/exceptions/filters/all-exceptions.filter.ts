import {
  ArgumentsHost,
  // BadRequestException,
  Catch,
  ExceptionFilter,
  // HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
// import { ErrorResponseBody } from './error-response-body.type';
// import { DomainExceptionCode } from '../domain-exception-codes';
import { Response } from 'express';

//Все ошибки
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.error(exception);

    if (exception instanceof ThrottlerException) {
      response.status(429).json({
        errorsMessages: [
          {
            field: '',
            message: 'Too many requests',
          },
        ],
      });
      return;
    }

    //Если сработал этот фильтр, то пользователю улетит 500я ошибка
    const message =
      exception instanceof Error
        ? exception.message
        : 'Unknown exception occurred.';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorsMessages: [
        {
          field: '',
          message,
        },
      ],
    });
  }
}