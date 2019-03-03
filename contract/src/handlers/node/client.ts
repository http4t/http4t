import * as node from 'http';
import {Readable, Writable} from 'stream';
import {HttpHandler, HttpRequest, HttpResponse} from '../../';
import {requestHttp4tToNode, responseNodeToHttp4t} from "./conversions";
import {bodyToStream} from "./streams";


export class ClientHandler implements HttpHandler {
    async handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>(resolve => {
                const responseHandler = (nodeResponse: node.IncomingMessage) => {
                    resolve(responseNodeToHttp4t(nodeResponse));
                };
                const nodeRequest = node.request(requestHttp4tToNode(request), responseHandler);
                bodyToStream(request.body, nodeRequest);
            }
        );
    }
}


