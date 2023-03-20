import {route, Route} from "../routes";
import {WithSecurity} from "./withSecurity";
import {isFailure, Result, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {SecuredRoutes} from "./";
import {AuthError} from "./authError";

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

export function tokenToClaimsRoute<In, Out, TToken, TClaims, TAuthError>(
    unsecuredRoute: Route<WithSecurity<In, TToken>, Result<TAuthError, Out>>,
    tokenToClaims: (token: TToken) => Promise<RoutingResult<TClaims>>)

    : Route<WithSecurity<In, TClaims>, Result<TAuthError, Out>> {

    return route(
        new TokenToClaimsLens(unsecuredRoute.request, tokenToClaims),
        unsecuredRoute.response);
}

export function tokenToClaimsRoutes<TRoutes extends SecuredRoutes<TRoutes, TToken, TAuthError>, TToken, TClaims, TAuthError = AuthError>(
    tokenSecuredRoutes: TRoutes,
    tokenToClaims: (token: TToken) => Promise<RoutingResult<TClaims>>)

    : SecuredRoutes<TRoutes, TClaims, TAuthError> {

    return Object.entries(tokenSecuredRoutes)
        .reduce(
            (previousValue, [k, r]) => {
                const secured = tokenToClaimsRoute(
                    r as Route<WithSecurity<any, TToken>, Result<TAuthError, any>>,
                    tokenToClaims);
                return Object.assign({}, previousValue, {[k]: secured})
            },
            {} as SecuredRoutes<TRoutes, TClaims, TAuthError>);
}

