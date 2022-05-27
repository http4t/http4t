import {route, Route, Routes} from "../routes";
import {WithClaims} from "./index";
import {Failure, isFailure, Result, Success, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {Mutable} from "../util/mutable";


export class ClientSecuredRequestLens<T, TToken, TClaims> extends BaseRequestLens<T> {
    constructor(private readonly serverLens: RequestLens<WithClaims<T, TClaims>, WithClaims<T, TToken>>,
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
        return this.serverLens.set(into, {value, claims: this.token});
    }
}

export type UnsecuredRouteFor<TRoute> =
    TRoute extends Route<WithClaims<infer InGet, infer TClaims>,
            Result<infer TAuthError, infer Out>,
            WithClaims<infer InSet, infer TToken>>

        ? Route<InGet,
            Result<TAuthError, Out>,
            InSet>

        : never;
/**
 * Maps `TRoutes`, lifting `InGet` out of `WithClaims<InGet, TClaims>` and `InSet` out of `WithClaims<InSet, TClaims>`
 *
 * The inverse of {@link SecuredRoutesFor}
 */
export type UnsecuredRoutesFor<TRoutes extends Routes> = { readonly [K in keyof TRoutes]: UnsecuredRouteFor<TRoutes[K]> }

export type SecuredRoute<TToken, TClaims, TAuthError> = Route<WithClaims<any, TClaims>, Result<TAuthError, any>, WithClaims<any, TToken>>;
/**
 * Routes where:
 *
 * 1. All request lenses have `InGet` of `WithClaims<T,TClaims>` and `InSet` of `WithClaims<T,TToken>`
 *    (because the server, which `get`s from the request lens will want to deal with `TClaims` and the client, which
 *    `set`s the request lens will want to pass `TToken`)
 * 2. All response lenses have `InGet` and `InSet` returning `Result<TAuthError, T`
 */
export type SecuredRoutes<TToken, TClaims, TAuthError> =
    { readonly [k: string]: SecuredRoute<TToken, TClaims, TAuthError> }

export function tokenProvidedRoute<TRoute extends Route<WithClaims<any, any>, Result<any, any>, WithClaims<any, TToken>>, TToken>(
    serverRoute: TRoute,
    token: TToken)

    : UnsecuredRouteFor<TRoute> {

    return route(
        new ClientSecuredRequestLens(serverRoute.request, token),
        serverRoute.response) as UnsecuredRouteFor<TRoute>;
}

export function tokenProvidedRoutes<TRoutes extends SecuredRoutes<TToken, TClaims, TAuthError>, TToken, TClaims, TAuthError>(
    serverRoutes: TRoutes,
    token: TToken)
    : UnsecuredRoutesFor<TRoutes> {

    return Object.entries(serverRoutes)
        .reduce(
            (acc, [k, route]) => {
                const secured: Route<WithClaims<unknown, TClaims>, Success<unknown> | Failure<TAuthError>, WithClaims<unknown, TToken>> extends Route<WithClaims<infer InGet, infer TClaims>, Result<infer TAuthError, infer Out>, WithClaims<infer InSet, infer TToken>> ? Route<InGet, Result<TAuthError, Out>, InSet> : never = tokenProvidedRoute(
                    route as Route<WithClaims<unknown, TClaims>, Result<TAuthError, unknown>, WithClaims<unknown, TToken>>,
                    token);
                acc[k as keyof UnsecuredRoutesFor<TRoutes>] = secured as any;
                return acc;
            },
            {} as Mutable<UnsecuredRoutesFor<TRoutes>>)
}