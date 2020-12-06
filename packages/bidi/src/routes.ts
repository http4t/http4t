import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RequestLens, ResponseLens} from "./lenses";

export type Route<TRequest, TResponse> = {
    readonly request: RequestLens<TRequest>;
    readonly response: ResponseLens<TResponse>;
}

export type HandlerFn0<Out = any> = () => Promise<Out>;
export type HandlerFn1<In = any, Out = any> = (arg: In) => Promise<Out>;
export type HandlerFn = HandlerFn0 | HandlerFn1

export type ValidApi = { readonly [k: string]: HandlerFn };

export type RouteFor<T extends HandlerFn> =
    T extends HandlerFn1<infer In, infer Out>
        ? Route<In, Out>
        : T extends HandlerFn0<infer Out>
        ? Route<undefined, Out>
        : never;
/**
 * A collection of named http routes, which form an api.
 */
export type Routes<T extends ValidApi> = { readonly [K in keyof T]: RouteFor<T[K]> };

export type UnPromise<T> = T extends Promise<infer U> ? U : T;

export function route<TRequest, TResponse>(
    request: RequestLens<TRequest> | MessageLens<HttpMessage, TRequest>,
    response: ResponseLens<TResponse> | MessageLens<HttpMessage, TResponse>): Route<TRequest, UnPromise<TResponse>> {
    return {
        request: request as RequestLens<TRequest>,
        response: response as ResponseLens<UnPromise<TResponse>>
    };
}