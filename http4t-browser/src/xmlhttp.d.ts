import { HttpHandler, HttpRequest, HttpResponse } from "../../http4t-core/src/contract";
export declare class XmlHttpHandler implements HttpHandler {
    private readonly handler;
    constructor(handler?: XMLHttpRequest);
    handle(request: HttpRequest): Promise<HttpResponse>;
    private getHeaders;
    private unsafeHeaders;
    private setHeaders;
}
