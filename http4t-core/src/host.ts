import {HttpHandler, HttpRequest, HttpResponse} from "./contract";
import {setHeader} from "./messages";

/**
 * Sets Host header on requests
 */
export class HostHandler implements HttpHandler {
    constructor(private handler: HttpHandler, private host: string) {
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return this.handler.handle(setHeader(request, 'Host', this.host));
    }
}
