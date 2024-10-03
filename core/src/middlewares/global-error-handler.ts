import { NextFunction, Request, Response } from 'express';
import { BaseResponse } from '../response';
import { HttpError } from '../errors';

export function globalErrorHanlder(
  error: unknown,
  request: Request,
  response: Response<BaseResponse>,
  next: NextFunction
) {
  let message = '';
  let statusCode = 500;

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
  }

  if (error instanceof Error) {
    console.log(`${error.name}: ${error.message}`);
    message = error.message;
  } else {
    console.log('unknown error');
    message = `An unknown error occurred ${String(error)}`;
  }

  response.status(statusCode).send({
    message,
    success: false,
    data: null,
    traceStack:
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.stack
        : undefined,
  });
}
