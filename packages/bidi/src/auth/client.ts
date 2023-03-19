import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {isFailure, Result, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {Mutable} from "../util/mutable";
import {AuthReportingRoute, SecuredRoute, SecuredRoutes} from "./clientserver";

export class ProvideSecurityTokenLens<T, TToken> extends BaseRequestLens<T> {
    constructor(private readonly securedLens: RequestLens<WithSecurity<T, TToken>>,
                private readonly token: TToken) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<T>> {
        const serverResult = await this.securedLens.get(from);

        if (isFailure(serverResult)) {
            return serverResult;
        }
        return success(serverResult.value.value);
    }

    async setRequest(into: HttpRequest, value: T): Promise<HttpRequest> {
        return this.securedLens.set(into, {value, security: this.token});
    }
}

export type UnsecuredRouteFor<TRoute> =
    TRoute extends Route<WithSecurity<infer TRequest, infer TSecurity>,
            Result<infer TAuthError, infer TResponse>>

        ? Route<TRequest,
            Result<TAuthError, TResponse>>

        : never;

export type UnsecuredRoutesFor<TRoutes extends Routes> = { readonly [K in keyof TRoutes]: UnsecuredRouteFor<TRoutes[K]> }

export function tokenProvidedRoute<TRoute extends Route<WithSecurity<any, TToken>, any>, TToken>(
    serverRoute: TRoute,
    token: TToken)

    : UnsecuredRouteFor<TRoute> {

    return route(
        new ProvideSecurityTokenLens(serverRoute.request, token),
        serverRoute.response) as UnsecuredRouteFor<TRoute>;
}

export function tokenProvidedRoutes<TRoutes extends SecuredRoutes<TRoutes, TToken>, TToken>(
    serverRoutes: TRoutes,
    token: TToken)
    : UnsecuredRoutesFor<TRoutes> {

    return Object.entries(serverRoutes)
        .reduce(
            (acc, [k, route]) => {
                const secured = tokenProvidedRoute(
                    route as SecuredRoute<AuthReportingRoute<any>, TToken>,
                    token);
                acc[k as keyof UnsecuredRoutesFor<TRoutes>] = secured as any;
                return acc;
            },
            {} as Mutable<UnsecuredRoutesFor<TRoutes>>)
}