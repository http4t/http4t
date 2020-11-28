import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {handler} from "@http4t/core/handlers";

export type Filter = (decorated: HttpHandler) => HttpHandler;

export function filterRequest(fn: (request: HttpRequest) => HttpRequest): Filter {
    return filter(fn, r => r);
}

export function filterResponse(fn: (response: HttpResponse) => HttpResponse): Filter {
    return filter(r => r, fn)
}

export function filter(requestFilter: (request: HttpRequest) => HttpRequest,
                       responseFilter: (response: HttpResponse) => HttpResponse): Filter {
    return (decorated: HttpHandler): HttpHandler => {
        return handler(async (request) => {
            const thing = requestFilter(request);
            return responseFilter(await decorated.handle(thing));
        });
    }
}

export function middlewares(...ms: Filter[]): Filter {
    return (handler: HttpHandler): HttpHandler => {
        return ms.reduce((handler, m) => m(handler), handler);
    }
}
