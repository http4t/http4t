import {HttpRequest, HttpResponse} from "@http4t/core/contract";
import {RouteFailed, WrongRoute} from "../lenses";
import {Route} from "../routes";
import {bufferText, removeHeaders, responseOf} from "@http4t/core/responses";
import {RequestLifecycle} from "../router";

export type ProductionRequestLifecycleReporter = (request: HttpRequest, e: any) => Promise<void>;

export class ProductionRequestLifecycle implements RequestLifecycle {
    constructor(private readonly reporter: ProductionRequestLifecycleReporter) {
    }

    async begin(request: HttpRequest): Promise<HttpRequest> {
        return request;
    }

    async clientError(request: HttpRequest, routeKey: string, route: Route, reason: RouteFailed): Promise<HttpResponse> {
        return reason.response;
    }

    async match(request: HttpRequest, routeKey: string, route: Route, response: HttpResponse): Promise<HttpResponse> {
        return response;
    }

    async mismatch(request: HttpRequest, routeKey: string, route: Route, reason: WrongRoute): Promise<void> {
    }

    async noMatchFound(request: HttpRequest): Promise<HttpResponse> {
        return responseOf(404);
    }

    async serverError(request: HttpRequest, routeKey: string, route: Route | null, error: any): Promise<HttpResponse> {
        await this.reporter(request, error)
        return responseOf(500);
    }

}

export const CONSOLE_ERR_STRIP_COOKIES_AND_AUTHORITY: ProductionRequestLifecycleReporter = async (request, e) => {
    console.error({
        request: await bufferText(removeHeaders(request, 'Cookie', 'Authorization')),
        error: e.toString(),
        stack: e.stack
    })
};

export const PROD_LIFECYCLE = new ProductionRequestLifecycle(CONSOLE_ERR_STRIP_COOKIES_AND_AUTHORITY);

export function prod(reporter: ProductionRequestLifecycleReporter): RequestLifecycle {
    return new ProductionRequestLifecycle(reporter);
}