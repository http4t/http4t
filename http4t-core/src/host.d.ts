import { HttpHandler, HttpRequest, HttpResponse } from "./contract";
export declare class HostHandler implements HttpHandler {
    private handler;
    private host;
    constructor(handler: HttpHandler, host: string);
    handle(request: HttpRequest): Promise<HttpResponse>;
}
