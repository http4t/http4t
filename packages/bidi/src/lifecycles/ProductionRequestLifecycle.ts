import {HttpRequest, HttpResponse} from "@http4t/core/contract";
import {RouteFailed, WrongRoute} from "../lenses";
import {Route} from "../routes";
import {appendHeaders, bufferText, removeHeaders, responseOf} from "@http4t/core/responses";
import {RequestLifecycle} from "../router";
import {Http4tHeaders, Http4tRouteResult} from "./headers";

export const logErrorStrippingCookiesAndAuthHeaders: ServerErrorReporter = async (request, e) => {
    console.error({
        // TODO: what if body has already been streamed?
        request: await bufferText(removeHeaders(request, 'Cookie', 'Authorization')),
        error: e.toString(),
        stack: e.stack
    })
};

export type ServerErrorReporter = (request: HttpRequest, e: any) => Promise<void>;

export type ProductionRequestLifecycleOpts = {
    reportServerError: ServerErrorReporter;
}
export const DEFAULTS: ProductionRequestLifecycleOpts = {
    reportServerError: logErrorStrippingCookiesAndAuthHeaders
}

export class ProductionRequestLifecycle implements RequestLifecycle {
    private readonly opts: ProductionRequestLifecycleOpts;

    constructor(opts: Partial<ProductionRequestLifecycleOpts>) {
        this.opts = {...DEFAULTS, ...opts}
    }

    async begin(request: HttpRequest): Promise<HttpRequest> {
        return request;
    }

    async clientError(request: HttpRequest, routeKey: string, route: Route, reason: RouteFailed): Promise<HttpResponse> {
        return appendHeaders(reason.response,
            [Http4tHeaders.ROUTE_RESULT, Http4tRouteResult.CLIENT_ERROR]);
    }

    async match(request: HttpRequest, routeKey: string, route: Route, response: HttpResponse): Promise<HttpResponse> {
        return appendHeaders(response,
            [Http4tHeaders.ROUTE_RESULT, Http4tRouteResult.SUCCESS]);
    }

    async mismatch(request: HttpRequest, routeKey: string, route: Route, reason: WrongRoute): Promise<void> {
    }

    async noMatchFound(request: HttpRequest): Promise<HttpResponse> {
        return responseOf(404,
            undefined,
            [Http4tHeaders.ROUTE_RESULT, Http4tRouteResult.NO_MATCH]);
    }

    async serverError(request: HttpRequest, routeKey: string, route: Route | null, error: any): Promise<HttpResponse> {
        await this.opts.reportServerError(request, error)
        return responseOf(500,
            undefined,
            [Http4tHeaders.ROUTE_RESULT, Http4tRouteResult.SERVER_ERROR]);
    }

}

export const PROD_LIFECYCLE = prod();

export function prod(opts: Partial<ProductionRequestLifecycleOpts> = {}): RequestLifecycle {
    return new ProductionRequestLifecycle(opts);
}