import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {ROUTE_FAILED, RouteFailed, RoutingResult, WRONG_ROUTE, WrongRoute} from "./lenses";
import {PROD_LIFECYCLE} from "./lifecycles/ProductionRequestLifecycle";
import {Route, Routes, ServerApiFor} from "./routes";


export interface RequestLifecycle {
    /**
     * The Router is about to start matching a request
     *
     * Router will use the returned request from this function, so the RequestLifecycle can add a request id here,
     * for example,
     */
    begin(request: HttpRequest): Promise<HttpRequest>

    /**
     * This was the wrong route
     *
     * Router will continue looking for a matching route
     */
    mismatch(request: HttpRequest, routeKey: string, route: Route, reason: WrongRoute): Promise<void>

    /**
     * This route successfully handled the request and returned response.
     *
     * The Router will not consider any more routes, and will return the result of this function.
     */
    match(request: HttpRequest, routeKey: string, route: Route, response: HttpResponse): Promise<HttpResponse>

    /**
     * This was the right route to handle the request, but the request is not valid for this route (e.g. the body is
     * not serialized correctly). For example because the url was matched to a route but the body was not valid json.
     *
     * The Router will not consider any more routes, and will return the result of this function, which would normally
     * be the response in the reason parameter. You might have a debug RequestLifecycle that adds reason.problems to the
     * body of the response, and a production handler that returns the unmodified `reason.response`.
     */
    clientError(request: HttpRequest, routeKey: string, route: Route, reason: RouteFailed): Promise<HttpResponse>

    /**
     * Router has tried every available route, and none matched the request
     *
     * Router will return the result of this function, normally a 404
     *
     * A debug RequestLifecycle might set the HttpResponse body to be a list of each route tried and its
     * WrongRoute.problems.
     */
    noMatchFound(request: HttpRequest): Promise<HttpResponse>

    /**
     * Either a route or another method in this RequestLifecycle threw an unexpected exception.
     *
     * The Router will not consider any more routes, and will return the result of this method, which would usually be
     * a 500
     *
     * *NB: If this method ever throws an exception the router will print stack trace and return an empty 500*
     */
    serverError(request: HttpRequest, routeKey: string, route: Route, error: any): Promise<HttpResponse>
}


export type RoutingContext<TRoutes extends Routes> = {
    route: keyof ServerApiFor<TRoutes>
}

export type ApiBuilder<TRoutes extends Routes> = (request: HttpRequest, context: RoutingContext<TRoutes>) => Promise<ServerApiFor<TRoutes>>;

export class Router<TRoutes extends Routes> implements HttpHandler {
    private readonly alphaOrderedRoutes: [keyof TRoutes & string, Route][]

    constructor(private readonly routes: TRoutes,
                private readonly api: ApiBuilder<TRoutes>,
                private readonly lifecycle: RequestLifecycle
    ) {
        /*  JS does not provided guarantees on Object.entries ordering.

        If we consider routes for matching in the order that Object.entries(routes) would return them, and two routes
        could potentially match the same request, then we might unexpectedly see the same request match a different route
        if anything changed the ordering of Object.entries. One example might be adding a new, unrelated route to the
        API, in which case it would be very surprising for it to surface a bug related to some other routes.

        To fix this, we alpha-order the routes to provide arbitrary but at least deterministic behaviour.
         */
        this.alphaOrderedRoutes = Object.entries(this.routes).sort(([k1], [k2]) => k1.localeCompare(k2)) as [keyof TRoutes & string, Route][];
    }

    async handle(originalRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const request = await this.lifecycle.begin(originalRequest);

            for (const [routeName, route] of this.alphaOrderedRoutes) {
                try {
                    const routingResult: RoutingResult = await route.request.get(request);

                    if (isFailure(routingResult)) {
                        switch (routingResult.error.type) {
                            case WRONG_ROUTE:
                                await this.lifecycle.mismatch(request, routeName, route, routingResult.error);
                                continue;
                            case ROUTE_FAILED:
                                return this.lifecycle.clientError(request, routeName, route, routingResult.error);
                        }
                    }

                    const apiResult = await this.executeApiFn(request, routeName, routingResult.value);
                    const httpResponse = await route.response.set(responseOf(200), apiResult);
                    return this.lifecycle.match(request, routeName, route, httpResponse);

                } catch (e: any) {
                    return await this.lifecycle.serverError(request, routeName, route, e);
                }
            }
            return this.lifecycle.noMatchFound(request);
        } catch (e: any) {
            console.error(e);
            return responseOf(500)
        }
    }

    private async executeApiFn(request: HttpRequest, routeName: keyof TRoutes, arg: any) {
        const api = await this.api(request, {route: routeName});
        const apiFn = api[routeName];
        const result = await apiFn(arg);
        return result;
    }
}

export function buildRouter<TRoutes extends Routes>(
    routes: TRoutes,
    api: ServerApiFor<TRoutes> | ApiBuilder<TRoutes>,
    lifecycle: RequestLifecycle = PROD_LIFECYCLE): HttpHandler {
    return new Router(routes, typeof api === "function" ? api : async () => api, lifecycle);
}
