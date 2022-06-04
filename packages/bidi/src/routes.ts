import {RequestLens, ResponseLens} from "./lenses";

/**
 * `TRequestSet` is used to serialize the request on the client-side
 * `TResponseGet` is used to deserialize the response on the client-side
 * `TRequestGet` is used to deserialize the request on the server-side
 * `TResponseSet` is used to serialize the response on the server-side
 */
export type Route<TRequestGet = unknown, TResponseGet = unknown, TRequestSet = TRequestGet, TResponseSet = TResponseGet> = {
    readonly request: RequestLens<TRequestGet, TRequestSet>;
    readonly response: ResponseLens<TResponseGet, TResponseSet>;
}


export function route<TRequestGet, TResponseGet, TRequestSet = TRequestGet, TResponseSet = TResponseGet>(
    request: RequestLens<TRequestGet, TRequestSet>,
    response: ResponseLens<TResponseGet, TResponseSet>): Route<TRequestGet, TResponseGet, TRequestSet, TResponseSet> {
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

export type RouteFor<TServerHandler, TClientHandler = TServerHandler> =
    TServerHandler extends HandlerFn0<infer TServerOut>
        ? TClientHandler extends HandlerFn0<infer TClientOut>
        ? Route<undefined, TClientOut, undefined, TServerOut>
        : TClientHandler extends HandlerFn1<infer TClientIn, infer TClientOut>
            ? Route<TClientIn, TClientOut, undefined, TServerOut>
            : never
        : TServerHandler extends HandlerFn1<infer TServerIn, infer TServerOut>
        ? TClientHandler extends HandlerFn0<infer TClientOut>
            ? Route<undefined, TClientOut, TServerIn, TServerOut>
            : TClientHandler extends HandlerFn1<infer TClientIn, infer TClientOut>
                ? Route<TClientIn, TClientOut, TServerIn, TServerOut>
                : never
        : never;

/**
 * Use as a compile-time check that symmetrical routes are compatible with `TApi`
 */
export type RoutesFor<
    TServerApi extends RoutableApi<TServerApi>,
    TClientApi extends RoutableApi<TServerApi> = TServerApi> =

    { readonly [K in keyof TServerApi]: RouteFor<TServerApi[K], TClientApi[K]> };

export type ServerApiFnFor<TRoute> = TRoute extends Route<infer TRequestGet, infer TResponseGet, infer TRequestSet, infer TResponseSet>
    ? TRequestGet extends undefined
        ? HandlerFn0<TResponseSet>
        : HandlerFn1<TRequestGet, TResponseSet>
    : never;

/**
 * Uses `TRequestGet` for method parameter and `TResponseSet` for return value
 */
export type ServerApiFor<TRoutes> = { readonly [K in keyof TRoutes]: ServerApiFnFor<TRoutes[K]> };

export type ClientApiFnFor<TRoute> = TRoute extends Route<infer TRequestGet, infer TResponseGet, infer TRequestSet, infer TResponseSet>
    ? TRequestGet extends undefined
        ? HandlerFn0<TResponseGet>
        : HandlerFn1<TRequestSet, TResponseGet>
    : never;
/**
 * Uses `TRequestSet` for method parameter and `TResponseGet` for return value
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