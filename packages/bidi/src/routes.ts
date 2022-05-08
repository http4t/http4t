import {RequestLens, ResponseLens} from "./lenses";

export type Route<InGet=unknown, OutGet=unknown, InSet = InGet, OutSet = OutGet> = {
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

export type CheckHandlerFn<T> =
    T extends HandlerFn
        ? T
        : never;
/**
 * bidi apis need to contain only zero-or-1 arity functions that return promises, because each function needs a lens
 * to serialize/deserialize the request, and lenses only take one parameter
 */
export type CheckValidApi<T> = { readonly [K in keyof T]: CheckHandlerFn<T[K]> };

export type RouteFor<T> =
    T extends HandlerFn1<infer In, infer Out>
        ? Route<In, Out>
        : T extends HandlerFn0<infer Out>
        ? Route<undefined, Out>
        : never;
/**
 * A collection of named http routes, which form an api.
 */
export type Routes<T> = { readonly [K in keyof T]: RouteFor<T[K]> };

export function routes<A, B>(a: Routes<A>, b: Routes<B>): Routes<A & B>;
export function routes<A, B, C>(a: Routes<A>, b: Routes<B>, c: Routes<C>): Routes<A & B & C>;
export function routes<A, B, C, D>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>): Routes<A & B & C & D>;
export function routes<A, B, C, D, E>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>): Routes<A & B & C & D & E>;
export function routes<A, B, C, D, E, F>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>, f: Routes<F>): Routes<A & B & C & D & E & F>;
export function routes<A, B, C, D, E, F, G>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>, f: Routes<F>, g: Routes<G>): Routes<A & B & C & D & E & F & G>;
export function routes<A, B, C, D, E, F, G, H>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>, f: Routes<F>, g: Routes<G>, h: Routes<H>): Routes<A & B & C & D & E & F & G & H>;
export function routes<A, B, C, D, E, F, G, H, I>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>, f: Routes<F>, g: Routes<G>, h: Routes<H>, i: Routes<I>): Routes<A & B & C & D & E & F & G & H & I>;
export function routes<A, B, C, D, E, F, G, H, I, J>(a: Routes<A>, b: Routes<B>, c: Routes<C>, d: Routes<D>, e: Routes<E>, f: Routes<F>, g: Routes<G>, h: Routes<H>, i: Routes<I>, j: Routes<J>): Routes<A & B & C & D & E & F & G & H & I & J>;
export function routes(...routes: Routes<any>[]): Routes<any> {
    return routes.reduce((previousValue, currentValue) => Object.assign({}, previousValue, currentValue));
}