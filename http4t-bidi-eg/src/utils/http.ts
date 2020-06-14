import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";

export function toHttpHandler(handle: HttpHandler['handle']): HttpHandler {
    return new class implements HttpHandler {
        handle(request: HttpRequest): Promise<HttpResponse> {
            return handle(request);
        }
    };
}