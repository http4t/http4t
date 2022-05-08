import {route, Route, Routes} from "../routes";
import {AuthError, WithClaims} from "./index";
import {isFailure, Result, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";

export type SecuredRouteFor<TRoute, TToken, TClaims, TAuthError> =
    TRoute extends Route<infer InGet, Result<TAuthError, infer Out>, infer InSet>
        ? Route<WithClaims<InGet, TClaims>,
            Result<TAuthError, Out>,
            WithClaims<InSet, TToken>>
        : never;

/**
 * Maps routes, wrapping request lenses' `InGet` in `WithClaims<InGet,TClaims>` and `InSet` in `WithClaims<InSet,TToken>`
 *
 * Intuitively: the server will want to get `TClaims` so it can check them, and the client will want to set `TToken`
 * to authenticate itself to the server
 *
 * The inverse of {@link UnsecuredRoutesFor}
 */
export type SecuredRoutesFor<TRoutes extends Routes,
    TToken,
    TClaims,
    TAuthError = AuthError> =
    { readonly [K in keyof TRoutes]: SecuredRouteFor<TRoutes[K], TToken, TClaims, TAuthError> }

export class ServerSecuredRequestLens<T, TToken, TClaims> extends BaseRequestLens<WithClaims<T, TClaims>, WithClaims<T, TToken>> {
    constructor(private readonly unsecuredLens: RequestLens<T>,
                private readonly tokenLens: RequestLens<TClaims, TToken>) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<WithClaims<T, TClaims>>> {
        const routeResult = await this.unsecuredLens.get(from);
        if (isFailure(routeResult)) return routeResult;

        const claimsResult = await this.tokenLens.get(from);
        if (isFailure(claimsResult)) return claimsResult;

        return success({claims: claimsResult.value, value: routeResult.value});
    }

    async setRequest(into: HttpRequest, value: WithClaims<T, TToken>): Promise<HttpRequest> {
        const withToken = await this.tokenLens.set(into, value.claims);
        return this.unsecuredLens.set(withToken, value.value)
    }
}

export function serverSecuredRoute<In, Out, TToken, TClaims, TAuthError>(
    unsecuredRoute: Route<In, Result<TAuthError, Out>>,
    tokenLens: RequestLens<TClaims, TToken>)

    : Route<WithClaims<In, TClaims>, Result<TAuthError, Out>, WithClaims<In, TToken>> {

    return route(
        new ServerSecuredRequestLens(unsecuredRoute.request, tokenLens),
        unsecuredRoute.response);
}

/**
 * See `@http4t/bidi-jwt/jwtSecuredRoutes` for example usage
 *
 * @param unsecuredRoutes routes to be wrapped in {@link SecuredRoutesFor}
 * @param tokenLens will typically (on the server) `get` and validate `TToken` from the request and then map it to
 *                  `TClaims`, and (on the client) `set` a static `TToken` on the request that the client has obtained
 *                  from the server
 */
export function serverSecuredRoutes<TRoutes extends Routes, TToken, TClaims, TAuthError>(
    unsecuredRoutes: TRoutes,
    tokenLens: RequestLens<TClaims, TToken>)

    : SecuredRoutesFor<TRoutes, TToken, TClaims, TAuthError> {

    return Object.entries(unsecuredRoutes)
        .reduce(
            (previousValue, [k, route]) => {
                const secured = serverSecuredRoute(
                    route as Route<unknown, Result<TAuthError, unknown>>,
                    tokenLens);
                return Object.assign({}, previousValue, {[k]: secured})
            },
            {} as SecuredRoutesFor<TRoutes, TToken, TClaims, TAuthError>);
}