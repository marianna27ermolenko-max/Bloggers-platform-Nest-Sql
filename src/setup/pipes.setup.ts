import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain-exceptions';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации
//поставить логи и разберитесь как она работает
//TODO: tests
export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: Extension[],
): Extension[] => {
  console.log('errors', errors);
  console.log('errorMessage', errorMessage);

  const errorsForResponse = errorMessage || [];

  console.log('errorsForResponse', errorsForResponse);

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
      console.log('errorFormatter', errorFormatter);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);
      console.log('constrainKeys', constrainKeys);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          key: error.property,
        });
      }
      // console.log('errors', errors);
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  //На следующем занятии рассмотрим подробнее

  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      whitelist: true,
      transform: true, //делает трансформацию по типам - на през. слое

      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,

      // Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
