import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
export declare class ClientHandler implements HttpHandler {
    handle(request: HttpRequest): Promise<HttpResponse>;
}
