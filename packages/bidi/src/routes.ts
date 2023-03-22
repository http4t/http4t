import {RequestLens, ResponseLens} from "./lenses";

export type Route<TRequest = unknown, TResponse = unknown> = {
    readonly request: RequestLens<TRequest>;
    readonly response: ResponseLens<TResponse>;
}
export type RequestOf<T extends Route> = T extends Route<infer TRequest> ? TRequest : never;
export type ResponseOf<T extends Route> = T extends Route<any, infer TResponse> ? TResponse : never;

export function route<TRequest = unknown, TResponse = unknown>(
    request: RequestLens<TRequest>,
    response: ResponseLens<TResponse>): Route<TRequest, TResponse> {
    return {
        request: request,
        response: response
    };
}

export type HandlerFn0<TResponse = any> = () => Promise<TResponse>;
export type HandlerFn1<TRequest = any, TResponse = any> = (arg: TRequest) => Promise<TResponse>;
export type HandlerFn = HandlerFn0 | HandlerFn1
/**
 * An interface of only arity 1 or zero functions returning Promise
 */
export type RoutableApi<TApi> = { [K in keyof TApi]: HandlerFn };

export type Routes = { readonly [k: string]: Route };

export type RouteFor<TApiMethod> =
    TApiMethod extends HandlerFn0<infer TResponse>
        ? Route<undefined, TResponse>
        : TApiMethod extends HandlerFn1<infer TRequest, infer TResponse>
        ? Route<TRequest, TResponse>
        : never;

/**
 * Use as a compile-time check that symmetrical routes are compatible with `TApi`
 */
export type RoutesFor<TApi extends RoutableApi<TApi>> =
    { readonly [K in keyof TApi]: RouteFor<TApi[K]> };

/**
 * Uses `TRequestGet` for method parameter and `TResponseSet` for return value
 */
export type ApiFnFor<TRoute> = TRoute extends Route<infer TRequest, infer TResponse>
    ? TRequest extends undefined
        ? HandlerFn0<TResponse>
        : HandlerFn1<TRequest, TResponse>
    : never;

/**
 * Uses `TRequestGet` for method parameter and `TResponseSet` for return value
 */
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