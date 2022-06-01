import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import * as http from "http";
import * as https from "https";
import {RequestOptions} from "https";
import {requestHttp4tToNode, responseNodeToHttp4t} from "./conversions";
import {bodyToStream} from "./streams";

export type Handler = (options: RequestOptions, callback?: (res: http.IncomingMessage) => void) => http.ClientRequest;

function getStrategy(protocol: 'http:' | 'https:'): { request: Handler } {
    switch (protocol) {
        case 'http:':
            return http;
        case 'https:':
            return https;
        default:
            throw new Error(`unrecognised protocol: '${protocol}'`);
    }
}


export class ClientHandler implements HttpHandler {
    static defaultTo(protocol: 'http' | 'https'): ClientHandler {
        return new ClientHandler(protocol);
    }

    private constructor(private readonly defaultProtocol: "http" | "https") {
    }

    async handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>(async (resolve, reject) => {
                try {
                    const responseHandler = (nodeResponse: http.IncomingMessage) => {
                        const response = responseNodeToHttp4t(nodeResponse);
                        resolve(response);
                    };
                    const nodeOptions = requestHttp4tToNode(request, this.defaultProtocol);
                    const strategy = getStrategy(nodeOptions.protocol as any);

                    const nodeRequest = strategy.request(nodeOptions, responseHandler);

                    if (request.body === '') {
                        nodeRequest.end();
                    } else {
                        await bodyToStream(request.body, nodeRequest);
                    }
                } catch (e: any) {
                    reject(e);
                }
            }
        );
    }
}


