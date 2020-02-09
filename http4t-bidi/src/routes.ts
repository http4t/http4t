import {HttpMessage, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {Result} from "@http4t/result";

export interface BiDiLens<TIn, TOut> {
  inject(input: TIn, output: TOut): Promise<TOut>;

  extract(output: TOut): Promise<Result<TIn>>;
}

/**
 * Serializes/deserializes a value into/out of a message
 */
export interface MessageLens<T, TMessage extends HttpMessage = HttpMessage> extends BiDiLens<T, TMessage> {
}

export interface RequestLens<T> extends MessageLens<T, HttpRequest> {
}

export interface ResponseLens<T> extends MessageLens<T, HttpResponse> {
}

export interface Route<TRequest, TResponse> {
  readonly request: RequestLens<TRequest>;
  readonly response: ResponseLens<TResponse>;
}

/**
 * A collection of named http routes, which form an api.
 */
export type Routes = { [routeKey: string]: Route<any, any> };

export type HandlerFn<TReq, TRes> = (request: TReq) => Promise<TRes>;

export type Handler<T> = T extends Route<infer TReq, infer TRes>
  ? HandlerFn<TReq, TRes>
  : never;

/**
 * Named `HandlerFn`s of the correct types for each route.
 *
 * The client _creates_ an `Api`, where each key is a function which takes
 * a request, serialises it to an `HttpRequest`, sends it to an `HttpHandler`
 * and then deserialises the response.
 *
 * The server _uses_ a provided `Api` as the implementation of each `Route`,
 * automatically routing to the correct `HandlerFn`, deserialising the request,
 * and serialising the response.
 */
export type Api<TRoute extends Routes> = { [K in keyof TRoute]: Handler<TRoute[K]> };

export function route<TRequest, TResponse>(
  request: RequestLens<TRequest> | MessageLens<TRequest>,
  response: ResponseLens<TResponse> | MessageLens<TResponse>): Route<TRequest, TResponse> {
  return {
    request: request as RequestLens<TRequest>,
    response: response as ResponseLens<TResponse>
  };
}