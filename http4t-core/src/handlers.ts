import {HttpHandler, HttpRequest, HttpResponse} from "./contract";

export type HttpHandlerFn = (request: HttpRequest) => Promise<HttpResponse>;

export function handler(f: HttpHandlerFn): HttpHandler {
    return {handle: f};
}
