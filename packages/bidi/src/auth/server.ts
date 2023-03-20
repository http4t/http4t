import {route, Route} from "../routes";
import {WithSecurity} from "./withSecurity";
import {isFailure, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {SecuredRoutes} from "./";

export class TokenToClaimsLens<T, TToken, TClaims> extends BaseRequestLens<WithSecurity<T, TClaims>> {
    constructor(private readonly clientSideLens: RequestLens<WithSecurity<T, TToken>>,
                private readonly tokenToClaims: (token: TToken) => Promise<RoutingResult<TClaims>>) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<WithSecurity<T, TClaims>>> {
        const tokenResult = await this.clientSideLens.get(from);
        if (isFailure(tokenResult)) return tokenResult;

        const claimsResult = await this.tokenToClaims(tokenResult.value.security);
        if (isFailure(claimsResult)) return claimsResult;

        return success({
            security: claimsResult.value,
            value: tokenResult.value.value
        });
    }

    async setRequest(into: HttpRequest, value: WithSecurity<T, TClaims>): Promise<HttpRequest> {
        throw new Error(`${Object.getPrototypeOf(this).name} is not intended to be used by clients, only on the server`)
    }
}

export function tokenToClaimsRoute<In, Out, TToken, TClaims>(
    unsecuredRoute: Route<WithSecurity<In, TToken>, Out>,
    tokenToClaims: (token: TToken) => Promise<RoutingResult<TClaims>>)

    : Route<WithSecurity<In, TClaims>, Out> {

    return route(
        new TokenToClaimsLens(unsecuredRoute.request, tokenToClaims),
        unsecuredRoute.response);
}

export function tokenToClaimsRoutes<TRoutes extends SecuredRoutes<TRoutes, TToken>, TToken, TClaims>(
    tokenSecuredRoutes: TRoutes,
    tokenToClaims: (token: TToken) => Promise<RoutingResult<TClaims>>)

    : SecuredRoutes<TRoutes, TClaims> {

    return Object.entries(tokenSecuredRoutes)
        .reduce(
            (routes, [k, r]) => {
                routes[k as keyof TRoutes] = tokenToClaimsRoute(
                    r as Route<WithSecurity<any, TToken>, any>,
                    tokenToClaims);
                return routes;
            },
            {} as SecuredRoutes<TRoutes, TClaims>);
}

