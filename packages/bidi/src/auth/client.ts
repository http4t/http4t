import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {isFailure, Result, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {Mutable} from "../util/mutable";

export class ClientSecuredRequestLens<T, TToken> extends BaseRequestLens<T> {
    constructor(private readonly serverLens: RequestLens<any, WithSecurity<T, TToken>>,
                private readonly token: TToken) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<T>> {
        const serverResult = await this.serverLens.get(from);

        if (isFailure(serverResult)) {
            return serverResult;
        }
        return success(serverResult.value.value);
    }

    async setRequest(into: HttpRequest, value: T): Promise<HttpRequest> {
        return this.serverLens.set(into, {value, security: this.token});
    }
}

export type UnsecuredRouteFor<TRoute> =
    TRoute extends Route<
            WithSecurity<infer TRequestGet, infer TClaims>,
            Result<infer TAuthError, infer Out>,
            WithSecurity<infer TRequestSet, infer TToken>>

        ? Route<TRequestGet,
            Result<TAuthError, Out>,
            TRequestSet>

        : never;
/**
 * Maps `TRoutes`, lifting `TRequestGet` out of `WithSecurity<TRequestGet, TClaims>` and `TRequestSet` out of `WithSecurity<TRequestSet, TClaims>`
 *
 * The inverse of {@link SecuredRoutesFor}
 */
export type UnsecuredRoutesFor<TRoutes extends Routes> = { readonly [K in keyof TRoutes]: UnsecuredRouteFor<TRoutes[K]> }

export type SecuredRoute<TToken, TClaims> = Route<WithSecurity<any, TClaims>, any, WithSecurity<any, TToken>>;
/**
 * Routes where:
 *
 * 1. All request lenses have `TRequestGet` of `WithSecurity<T,TClaims>` and `TRequestSet` of `WithSecurity<T,TToken>`
 *    (because the server, which `get`s from the request lens will want to deal with `TClaims` and the client, which
 *    `set`s the request lens will want to pass `TToken`)
 * 2. All response lenses have `TRequestGet` and `TRequestSet` returning `Result<TAuthError, T`
 */
export type SecuredRoutes<TToken, TClaims> =
    { readonly [k: string]: SecuredRoute<TToken, TClaims> }

export function tokenProvidedRoute<TRoute extends Route<any, any, WithSecurity<any, TToken>>, TToken>(
    serverRoute: TRoute,
    token: TToken)

    : UnsecuredRouteFor<TRoute> {

    return route(
        new ClientSecuredRequestLens(serverRoute.request, token),
        serverRoute.response) as UnsecuredRouteFor<TRoute>;
}

export function tokenProvidedRoutes<TRoutes extends SecuredRoutes<TToken, any>, TToken>(
    serverRoutes: TRoutes,
    token: TToken)
    : UnsecuredRoutesFor<TRoutes> {

    return Object.entries(serverRoutes)
        .reduce(
            (acc, [k, route]) => {
                const secured = tokenProvidedRoute(
                    route as SecuredRoute<TToken, any>,
                    token);
                acc[k as keyof UnsecuredRoutesFor<TRoutes>] = secured as any;
                return acc;
            },
            {} as Mutable<UnsecuredRoutesFor<TRoutes>>)
}