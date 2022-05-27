import {RequestLens, ResponseLens} from "./lenses";

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
    THandler extends HandlerFn1<infer In, infer Out>
        ? Route<In, Out>
        : THandler extends HandlerFn0<infer Out>
        ? Route<undefined, Out>
        : never;
/**
 * Check that provided routes are compatible with TApi
 *
 * TODO: can we delete this?
 */
export type RoutesFor<TApi> = { readonly [K in keyof TApi]: RouteFor<TApi[K]> };

export type ApiFnFor<TRoute> = TRoute extends Route<infer In, infer Out, infer InSet, infer OutSet>
    ? In extends undefined
        ? HandlerFn0<Out>
        : HandlerFn1<In, Out>
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