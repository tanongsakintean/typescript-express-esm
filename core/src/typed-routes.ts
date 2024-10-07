import { Request, Response } from 'express';
import { z } from 'zod';
import { BaseResponse } from './response';
import { MaybePromise } from './types';
import { RequestHandler } from './routes';
import { ValidationError } from './errors';
import { fromZodError } from 'zod-validation-error';

export interface HandlerMetadata {
  __handlerMetadata: true;
  method: string;
  path: string;
  handler: RequestHandler;
}

export class TypedRoutes {
  get(path: string) {
    return new TypedRouteHandler(path, 'get');
  }

  post(path: string) {
    return new TypedRouteHandler(path, 'post');
  }

  put(path: string) {
    return new TypedRouteHandler(path, 'put');
  }

  delete(path: string) {
    return new TypedRouteHandler(path, 'delete');
  }
}

export type TypedHandler<
  TQuery extends z.ZodTypeAny,
  TParams extends z.ZodTypeAny,
  TBody extends z.ZodTypeAny,
  TResponse extends BaseResponse = BaseResponse
> = (context: {
  query: z.infer<TQuery>;
  params: z.infer<TParams>;
  body: z.infer<TBody>;
  req: Request<z.infer<TParams>, any, z.infer<TBody>, z.infer<TQuery>>;
  res: Response<TResponse>;
}) => MaybePromise<TResponse>;

export class TypedRouteHandler<
  RouteParams extends z.ZodTypeAny,
  RouteQuery extends z.ZodTypeAny,
  RouteBody extends z.ZodTypeAny
> {
  schema: { query?: z.ZodTypeAny; body?: z.ZodTypeAny; params?: z.ZodTypeAny } =
    {};

  constructor(private readonly path: string, private readonly method: string) {}

  query<Query extends z.ZodTypeAny>(schema: Query) {
    this.schema.query = schema;
    return this as unknown as TypedRouteHandler<RouteParams, Query, RouteBody>;
  }

  body<Body extends z.ZodTypeAny>(schema: Body) {
    this.schema.body = schema;
    return this as unknown as TypedRouteHandler<RouteParams, RouteQuery, Body>;
  }

  params<Params extends z.ZodTypeAny>(schema: Params) {
    this.schema.params = schema;
    return this as unknown as TypedRouteHandler<Params, RouteQuery, RouteBody>;
  }

  handler(handler: TypedHandler<RouteQuery, RouteParams, RouteBody>) {
    const invokeHandler = async (req: Request, res: Response) => {
      let message = '';
      let query;
      let params;
      let body;
      try {
        message = 'Query';
        query = this.schema.query
          ? this.schema.query.parse(req.query)
          : undefined;
        message = 'Params';
        params = this.schema.params
          ? this.schema.params.parse(req.params)
          : undefined;
        message = 'Body';
        body = this.schema.body ? this.schema.body.parse(req.body) : undefined;
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          throw new ValidationError(`${message} ${validationError.toString()}`);
        }
      }
      return handler({ query, params, body, req, res });
    };
    return {
      method: this.method,
      path: this.path,
      handler: invokeHandler,
      __handlerMetadata: true,
    };
  }
}
