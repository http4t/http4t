import {HttpMessage, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {JsonPathResult} from "@http4t/result/JsonPathResult";


export interface BiDiLens<Source, InjectedValue> {
  set(into: Source, value: InjectedValue): Promise<Source>;

  get(from: Source): Promise<JsonPathResult<InjectedValue>>;
}

/**
 * Serializes/deserializes a value into/out of a message
 */
export interface MessageLens<TMessage extends HttpMessage = HttpMessage, T = unknown> extends BiDiLens<TMessage, T> {
}

export interface RequestLens<T> extends MessageLens<HttpRequest, T> {
}

export interface ResponseLens<T> extends MessageLens<HttpResponse, T> {
}

export type UnPromise<T> = T extends Promise<infer U> ? U : T;
export type Route<TRequest, TResponse> = {
  readonly request: RequestLens<TRequest>;
  readonly response: ResponseLens<TResponse>;
}


export type HandlerFn0<Out = any> = () => Promise<Out>;
export type HandlerFn1<In = any, Out = any> = (arg: In) => Promise<Out>;
export type HandlerFn = HandlerFn0 | HandlerFn1

export type ValidApi = { [k: string]: HandlerFn };

export type RouteFor<T extends HandlerFn> =
  T extends (arg: infer In) => Promise<infer Out>
    ? Route<In, Out>
    : T extends () => Promise<infer Out>
    ? Route<undefined, Out>
    : never;
/**
 * A collection of named http routes, which form an api.
 */
export type Routes<T extends ValidApi> = { [K in keyof T]: RouteFor<T[K]> };

export function route<TRequest, TResponse>(
  request: RequestLens<TRequest> | MessageLens<HttpMessage, TRequest>,
  response: ResponseLens<TResponse> | MessageLens<HttpMessage, TResponse>): Route<TRequest, UnPromise<TResponse>> {
  return {
    request: request as RequestLens<TRequest>,
    response: response as ResponseLens<UnPromise<TResponse>>
  };
}