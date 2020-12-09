import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {responseOf} from "@http4t/core/responses";
import {isFailure} from "@http4t/result";
import {RequestLens} from "./lenses";
import {Routes, ValidApi} from "./routes";

export class Router<T extends ValidApi> implements HttpHandler {
    constructor(private readonly routes: Routes<T>,
                private readonly handlers: T) {
    }

    handle = async (request: HttpRequest): Promise<HttpResponse> => {
        for (const [key, route] of Object.entries(this.routes)) {
            const result = await (route.request as RequestLens<any>).get(request);

            if (isFailure(result)) {
                switch (result.error.type) {
                    case "wrong-route":
                        continue;
                    case "route-failed":
                        return result.error.response;
                }
            }

            const handler = this.handlers[key];
            try {
                const value = await handler(result.value);
                return route.response.set(responseOf(200), value);
            } catch (e) {
                return responseOf(500, e.message || e.toString());
            }
        }
        return responseOf(404);
    }
}

export function buildRouter<T extends ValidApi>(
    routes: Routes<T>,
    handlers: T): HttpHandler {
    return new Router(routes, handlers);
}
