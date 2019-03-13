/// <reference types="node" />
import * as node from 'http';
import { Server } from "@http4t/core/server";
import { HttpHandler, HttpRequest, HttpResponse, ParsedUri } from "@http4t/core/contract";
export declare class ServerHandler implements Server {
    private handler;
    private readonly server;
    private readonly uri;
    constructor(handler: HttpHandler, { port }?: {
        port?: number | undefined;
    });
    handle(request: HttpRequest): Promise<HttpResponse>;
    close(): Promise<void>;
    url(): Promise<ParsedUri>;
}
export declare const adapter: (handler: HttpHandler) => (nodeRequest: node.IncomingMessage, nodeResponse: node.ServerResponse) => void;
