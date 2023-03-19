import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {AuthError} from "./authError";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {isFailure, Result, success} from "@http4t/result";
import {HttpRequest} from "@http4t/core/contract";

export type AuthReportingRoute<TAuthError = AuthError> = Route<any, Result<TAuthError, any>>;
export type AuthReportingRoutes<TRoutes extends Routes, TAuthError = AuthError> =
    { [K in keyof TRoutes]: AuthReportingRoute<TAuthError> };

export type SecuredRoute<TRoute extends AuthReportingRoute<TAuthError>, TClaimsOrToken, TAuthError = AuthError> = Route<WithSecurity<any, TClaimsOrToken>, Result<TAuthError, any>>;

export type SecuredRoutes<TRoutes extends AuthReportingRoutes<TRoutes, TAuthError>, TClaimsOrToken, TAuthError = AuthError> =
    { [K in keyof TRoutes]: SecuredRoute<TRoutes[K], TClaimsOrToken, TAuthError> }

export class WithSecurityLens<T, TToken> extends BaseRequestLens<WithSecurity<T, TToken>> {
    constructor(private readonly unsecuredLens: RequestLens<T>,
                private readonly tokenLens: RequestLens<TToken>) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<WithSecurity<T, TToken>>> {
        const routeResult = await this.unsecuredLens.get(from);
        if (isFailure(routeResult)) return routeResult;

        const claimsResult = await this.tokenLens.get(from);
        if (isFailure(claimsResult)) return claimsResult;

        return success({
            security: claimsResult.value,
            value: routeResult.value
        });
    }

    async setRequest(into: HttpRequest, value: WithSecurity<T, TToken>): Promise<HttpRequest> {
        const withToken = await this.tokenLens.set(into, value.security);
        return this.unsecuredLens.set(withToken, value.value)
    }
}

export function securedRoute<TRoute extends Route<any, Result<TAuthError, any>>, TToken, TAuthError = AuthError>(
    unsecuredRoute: TRoute,
    tokenLens: RequestLens<TToken>)

    : SecuredRoute<TRoute, TToken, TAuthError> {

    return route(
        new WithSecurityLens(unsecuredRoute.request, tokenLens),
        unsecuredRoute.response as any //
    );
}

export function securedRoutes<TRoutes extends AuthReportingRoutes<TRoutes, TAuthError>, TToken, TAuthError = AuthError>(
    unsecuredRoutes: TRoutes,
    tokenLens: RequestLens<TToken>)

    : SecuredRoutes<TRoutes, TToken, TAuthError> {

    return Object.entries(unsecuredRoutes)
        .reduce(
            (previousValue, [k, route]) => {
                const secured = securedRoute<Route<any, Result<TAuthError, any>>, TToken, TAuthError>(
                    route as Route<unknown, Result<TAuthError, unknown>>,
                    tokenLens);
                return Object.assign({}, previousValue, {[k]: secured})
            },
            {} as SecuredRoutes<TRoutes, TToken, TAuthError>);
}
