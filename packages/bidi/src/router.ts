import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {RequestLens, ROUTE_FAILED, RouteFailed, WRONG_ROUTE, WrongRoute} from "./lenses";
import {CheckValidApi, Route, Routes} from "./routes";
import {PROD_LIFECYCLE} from "./lifecycles/ProductionRequestLifecycle";


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
    mismatch(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, reason: WrongRoute): Promise<void>

    /**
     * This route successfully handled the request and returned response.
     *
     * The Router will not consider any more routes, and will return the result of this function.
     */
    match(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, response: HttpResponse): Promise<HttpResponse>

    /**
     * This was the right route to handle the request, but the request is not valid for this route (e.g. the body is
     * not serialized correctly). For example because the url was matched to a route but the body was not valid json.
     *
     * The Router will not consider any more routes, and will return the result of this function, which would normally
     * be the response in the reason parameter. You might have a debug RequestLifecycle that adds reason.problems to the
     * body of the response, and a production handler that returns the unmodified `reason.response`.
     */
    clientError(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, reason: RouteFailed): Promise<HttpResponse>

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
    serverError(request: HttpRequest, routeKey: string, route: Route<unknown, unknown>, error: any): Promise<HttpResponse>
}

export class Router<T> implements HttpHandler {
    private readonly alphaOrderedRoutes : [ keyof T & string,Route][]

    constructor(private readonly routes: Routes<T>,
                private readonly routeBehaviours: CheckValidApi<T>,
                private readonly lifecycle: RequestLifecycle
    ) {
        /*  JS does not provided guarantees on Object.entries ordering.

        If we consider routes for matching in the order that Object.entries(routes) would return them, and two routes
        could potentially match the same request, then we might unexpectedly see the same request match a different route
        if anything changed the ordering of Object.entries. One example might be adding a new, unrelated route to the
        API, in which case it would be very surprising for it to surface a bug related to some other routes.

        To fix this, we alpha-order the routes to provide arbitrary but at least deterministic behaviour.
         */
        this.alphaOrderedRoutes = Object.entries(this.routes).sort(([k1], [k2])=>k1.localeCompare(k2)) as [ keyof T & string,Route][];
    }

    async handle(originalRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const request = await this.lifecycle.begin(originalRequest);

            for (const [routeName,route] of this.alphaOrderedRoutes) {
                try {
                    const requestMappingResult = await (route.request as RequestLens<any>).get(request);

                    if (isFailure(requestMappingResult)) {
                        switch (requestMappingResult.error.type) {
                            case WRONG_ROUTE:
                                await this.lifecycle.mismatch(request, routeName, route, requestMappingResult.error);
                                continue;
                            case ROUTE_FAILED:
                                return this.lifecycle.clientError(request, routeName, route, requestMappingResult.error);
                        }
                    }

                    const logicResult = await this.routeBehaviours[routeName](requestMappingResult.value);
                    const response = await route.response.set(responseOf(200), logicResult);
                    return this.lifecycle.match(request, routeName, route, response);
                } catch (e) {
                    return await this.lifecycle.serverError(request, routeName, route, e);
                }
            }
            return this.lifecycle.noMatchFound(request);
        } catch (e) {
            console.error(e);
            return responseOf(500)
        }
    }
}

export function buildRouter<T>(
    routes: Routes<T>,
    handlers: CheckValidApi<T>,
    lifecycle: RequestLifecycle = PROD_LIFECYCLE): HttpHandler {
    return new Router(routes, handlers, lifecycle);
}
