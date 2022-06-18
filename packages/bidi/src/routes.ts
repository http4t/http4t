import {RequestLens, ResponseLens} from "./lenses";

/**
 * `TRequestSet` is used to serialize the request on the client-side
 * `TResponseGet` is used to deserialize the response on the client-side
 * `TRequestGet` is used to deserialize the request on the server-side
 * `TResponseSet` is used to serialize the response on the server-side
 */
export type Route<TRequest = unknown, TResponse = unknown> = {
    readonly request: RequestLens<TRequest>;
    readonly response: ResponseLens<TResponse>;
}


export function route<TRequest = unknown, TResponse = unknown>(
    request: RequestLens<TRequest>,
    response: ResponseLens<TResponse>): Route<TRequest, TResponse> {
    return {
        request: request,
        response: response
    };
}

export type HandlerFn0<Out = any> = () => Promise<Out>;
export type HandlerFn1<In = any, Out = any> = (arg: In) => Promise<Out>;
export type HandlerFn = HandlerFn0 | HandlerFn1
/**
 * An interface of only arity 1 or zero functions returning Promise
 */
export type RoutableApi<TServerApi extends { [K in keyof TServerApi]: HandlerFn }> = { [K in keyof TServerApi]: HandlerFn };

export type Routes = { readonly [k: string]: Route };

export type RouteFor<TApi> =
    TApi extends HandlerFn0<infer TResponse>
        ? Route<undefined, TResponse>
        : TApi extends HandlerFn1<infer TRequest, infer TResponse>
        ? Route<TRequest, TResponse>
        : never;

/**
 * Use as a compile-time check that symmetrical routes are compatible with `TApi`
 */
export type RoutesFor<TApi extends RoutableApi<TApi>> =
    { readonly [K in keyof TApi]: RouteFor<TApi[K]> };

export type ApiFnFor<TRoute> = TRoute extends Route<infer TRequest, infer TResponse>
    ? TRequest extends undefined
        ? HandlerFn0<TResponse>
        : HandlerFn1<TRequest, TResponse>
    : never;

export type ApiFor<TRoutes> = { readonly [K in keyof TRoutes]: ApiFnFor<TRoutes[K]> };


export function routes<A extends Routes, B extends Routes>(a: A, b: B): A & B;
export function routes<A extends Routes, B extends Routes, C extends Routes>(a: A, b: B, c: C): A & B & C;
export function routes<A, B extends Routes, C extends Routes, D extends Routes>(a: A, b: B, c: C, d: D): A & B & C & D;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes, F extends Routes>(a: A, b: B, c: C, d: D, e: E, f: F): A & B & C & D & E & F;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes, F extends Routes, G extends Routes>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): A & B & C & D & E & F & G;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes, F extends Routes, G extends Routes, H extends Routes>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): A & B & C & D & E & F & G & H;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes, F extends Routes, G extends Routes, H extends Routes, I extends Routes>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I): A & B & C & D & E & F & G & H & I;
export function routes<A, B extends Routes, C extends Routes, D extends Routes, E extends Routes, F extends Routes, G extends Routes, H extends Routes, I extends Routes, J extends Routes>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J): A & B & C & D & E & F & G & H & I & J;
export function routes(...routes: Routes[]): Routes {
    return routes.reduce((previousValue, currentValue) => Object.assign({}, previousValue, currentValue));
}