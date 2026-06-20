export class FieldError {
  field: string;
  message: string;
}

export class APIErrorResult {
  errorsMessages: FieldError[];
}

export class ExceptionResponse {
  message: string;
  statusCode?: number;
}

export type BadRequestResponse =
  | string
  | {
      message: string | ValidationErrorItem[];
      error?: string;
      statusCode?: number;
    };

export class ValidationErrorItem {
  property: string;
  constraints?: Record<string, string>;
}
