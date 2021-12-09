import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {RequestLens, ROUTE_FAILED, RouteFailed, WRONG_ROUTE, WrongRoute} from "./lenses";
import {Route, Routes, ValidApi} from "./routes";
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

export class Router<T extends ValidApi> implements HttpHandler {
    constructor(private readonly routes: Routes<T>,
                private readonly routeBehaviours: T,
                private readonly lifecycle: RequestLifecycle
    ) {
    }

    async handle(originalRequest: HttpRequest): Promise<HttpResponse> {
        try {
            const request = await this.lifecycle.begin(originalRequest);
            for (const routeEntry of Object.entries(this.routes)) {
                const key = routeEntry[0];
                const route: Route<unknown, unknown> = routeEntry[1];
                try {
                    const requestMappingResult = await (route.request as RequestLens<any>).get(request);

                    if (isFailure(requestMappingResult)) {
                        switch (requestMappingResult.error.type) {
                            case WRONG_ROUTE:
                                await this.lifecycle.mismatch(request, key, route, requestMappingResult.error);
                                continue;
                            case ROUTE_FAILED:
                                return this.lifecycle.clientError(request, key, route, requestMappingResult.error);
                        }
                    }

                    const logicResult = await this.routeBehaviours[key](requestMappingResult.value);
                    const response = await route.response.set(responseOf(200), logicResult);
                    return this.lifecycle.match(request, key, route, response);
                } catch (e) {
                    await this.lifecycle.serverError(request, key, route, e);
                }
            }
            return this.lifecycle.noMatchFound(request);
        } catch (e) {
            console.error(e);
            return responseOf(500)
        }
    }
}

export function buildRouter<T extends ValidApi>(
    routes: Routes<T>,
    handlers: T,
    lifecycle: RequestLifecycle = PROD_LIFECYCLE): HttpHandler {
    return new Router(routes, handlers, lifecycle);
}
