import {RequestLens, ResponseLens} from "./lenses";

/**
 * `InSet` is used to serialize the request on the client-side
 * `OutGet` is used to deserialize the response on the client-side
 * `InGet` is used to deserialize the request on the server-side
 * `OutSet` is used to serialize the response on the server-side
 */
export type Route<InGet = unknown, OutGet = unknown, InSet = InGet, OutSet = OutGet> = {
    readonly request: RequestLens<InGet, InSet>;
    readonly response: ResponseLens<OutGet, OutSet>;
}


export function route<InGet, OutGet, InSet = InGet, OutSet = OutGet>(
    request: RequestLens<InGet, InSet>,
    response: ResponseLens<OutGet, OutSet>): Route<InGet, OutGet, InSet, OutSet> {
    return {
        request: request,
        response: response
    };
}

export type HandlerFn0<Out = any> = () => Promise<Out>;
export type HandlerFn1<In = any, Out = any> = (arg: In) => Promise<Out>;
export type HandlerFn = HandlerFn0 | HandlerFn1

export type Routes = { readonly [k: string]: Route };

export type RouteFor<THandler> =
    THandler extends HandlerFn0<infer Out>
        ? Route<undefined, Out>
        : THandler extends HandlerFn1<infer In, infer Out>
        ? Route<In, Out>
        : never;
/**
 * Use as a compile-time check that symmetrical routes are compatible with `TApi`
 */
export type RoutesFor<TApi> = { readonly [K in keyof TApi]: RouteFor<TApi[K]> };

export type ServerApiFnFor<TRoute> = TRoute extends Route<infer InGet, infer OutGet, infer InSet, infer OutSet>
    ? InGet extends undefined
        ? HandlerFn0<OutSet>
        : HandlerFn1<InGet, OutSet>
    : never;
/**
 * Uses `InGet` for method parameter and `OutSet` for return value
 */
export type ServerApiFor<TRoutes> = { readonly [K in keyof TRoutes]: ServerApiFnFor<TRoutes[K]> };

export type ClientApiFnFor<TRoute> = TRoute extends Route<infer InGet, infer OutGet, infer InSet, infer OutSet>
    ? InGet extends undefined
        ? HandlerFn0<OutGet>
        : HandlerFn1<InSet, OutGet>
    : never;
/**
 * Uses `InSet` for method parameter and `OutGet` for return value
 */
export type ClientApiFor<TRoutes> = { readonly [K in keyof TRoutes]: ClientApiFnFor<TRoutes[K]> };


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