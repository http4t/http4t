import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {Mutable} from "../util/mutable";
import {SecuredRoute, SecuredRoutes} from "./";

export class ProvideSecurityTokenLens<T, TToken> extends BaseRequestLens<T> {
    constructor(private readonly securedLens: RequestLens<WithSecurity<T, TToken>>,
                private readonly token: () => Promise<TToken> | TToken) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<T>> {
        throw new Error(`${Object.getPrototypeOf(this).name} is not intended to be used on the server, only in clients`)
    }

    async setRequest(into: HttpRequest, value: T): Promise<HttpRequest> {
        const token = await this.token();
        return this.securedLens.set(into, {value, security: token});
    }
}

export type UnsecuredRouteFor<TRoute> =
    TRoute extends Route<WithSecurity<infer TRequest, infer TSecurity>,
            infer TResponse>

        ? Route<TRequest, TResponse>

        : never;

export type UnsecuredRoutesFor<TRoutes extends Routes> = { readonly [K in keyof TRoutes]: UnsecuredRouteFor<TRoutes[K]> }

export function tokenProvidedRoute<TRoute extends Route<WithSecurity<any, TToken>, any>, TToken>(
    serverRoute: TRoute,
    token: () => Promise<TToken> | TToken)

    : UnsecuredRouteFor<TRoute> {

    return route(
        new ProvideSecurityTokenLens(serverRoute.request, token),
        serverRoute.response) as UnsecuredRouteFor<TRoute>;
}

/**
 * For a route taking a request of {@link WithSecurity<{something:string},TToken>}, turns
 */
export function tokenProvidedRoutes<TRoutes extends SecuredRoutes<TRoutes, TToken>, TToken>(
    routesSecuredByTToken: TRoutes,
    token: () => Promise<TToken> | TToken)
    : UnsecuredRoutesFor<TRoutes> {

    return Object.entries(routesSecuredByTToken)
        .reduce(
            (acc, [k, route]) => {
                const secured = tokenProvidedRoute(
                    route as SecuredRoute<any, TToken>,
                    token);
                acc[k as keyof UnsecuredRoutesFor<TRoutes>] = secured as any;
                return acc;
            },
            {} as Mutable<UnsecuredRoutesFor<TRoutes>>)
}