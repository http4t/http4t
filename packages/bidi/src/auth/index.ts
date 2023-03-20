import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {isFailure, success} from "@http4t/result";
import {HttpRequest} from "@http4t/core/contract";

export type SecuredRoute<TRoute extends Route, TClaimsOrToken> =
    Route<WithSecurity<any, TClaimsOrToken>, any>;

export type SecuredRoutes<TRoutes extends Routes, TClaimsOrToken> =
    { [K in keyof TRoutes]: SecuredRoute<TRoutes[K], TClaimsOrToken> }

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

export function securedRoute<TRoute extends Route, TToken>(
    unsecuredRoute: TRoute,
    tokenLens: RequestLens<TToken>)

    : SecuredRoute<TRoute, TToken> {

    return route(
        new WithSecurityLens(unsecuredRoute.request, tokenLens),
        unsecuredRoute.response as any //
    );
}

export function securedRoutes<TRoutes extends Routes, TToken>(
    unsecuredRoutes: TRoutes,
    tokenLens: RequestLens<TToken>)

    : SecuredRoutes<TRoutes, TToken> {

    return Object.entries(unsecuredRoutes)
        .reduce(
            (routes, [k, route]) => {
                routes[k as keyof TRoutes] = securedRoute(
                    route as Route,
                    tokenLens);
                return routes;
            },
            {} as SecuredRoutes<TRoutes, TToken>);
}
