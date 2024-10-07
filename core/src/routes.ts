import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import { MaybePromise } from './types';
import { BaseResponse } from './response';
import { HandlerMetadata } from './typed-routes';

export const catchAsync =
  (
    fn: (...args: any[]) => any // รับ invokeHandler มา
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    /// โยน invokeHandler ข้า Middleware ้ถ้าไม่ error เข้า resolve ้error เข้า catch
    Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => MaybePromise<BaseResponse>;

export class Router {
  constructor(public instance: express.Router = express.Router()) {}

  private preRequest(handler: RequestHandler) {
    // is middlware  handler error ?
    const invokeHandler = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const result = await handler(req, res, next);
      return res.send({
        success: true,
        message: 'Successfuly',
        ...result,
      } satisfies BaseResponse);
    };
    return catchAsync(invokeHandler); // ดักว่ามี throw error ไหม
  }

  private extractHandlers(handlers: RequestHandler[]) {
    const handler = handlers[handlers.length - 1];
    const middleware = handlers.slice(0, handlers.length - 1);
    return { handler, middleware };
  }

  get(path: string, ...handlers: RequestHandler[]) {
    const { handler, middleware } = this.extractHandlers(handlers);

    this.instance.get(path, middleware, this.preRequest(handler));
  }

  post(path: string, ...handlers: RequestHandler[]) {
    const { handler, middleware } = this.extractHandlers(handlers);

    this.instance.post(path, middleware, this.preRequest(handler));
  }

  put(path: string, ...handlers: RequestHandler[]) {
    const { handler, middleware } = this.extractHandlers(handlers);

    this.instance.put(path, middleware, this.preRequest(handler));
  }

  delete(path: string, ...handlers: RequestHandler[]) {
    const { handler, middleware } = this.extractHandlers(handlers);

    this.instance.delete(path, middleware, this.preRequest(handler));
  }

  registerClassRoutes(classInstance: object) {
    const fields = Object.values(classInstance);
    fields.forEach((field) => {
      const route = field as HandlerMetadata;
      if (route.__handlerMetadata) {
        const { path, handler } = route;
        const method = route.method.toLocaleLowerCase();
        console.log('Registering route', method, path);
        (this.instance.route(path) as any)[method](this.preRequest(handler));
      }
    });
    return this;
  }
}
