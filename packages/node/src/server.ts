import {HttpHandler, ParsedUri} from "@http4t/core/contract";
import * as handlers from "@http4t/core/handlers";
import {HttpHandlerFn} from "@http4t/core/handlers";
import {Server} from "@http4t/core/server";
import {Uri} from "@http4t/core/uri";
import * as node from 'http';
import {requestNodeToHttp4t, responseHttp4tToNode} from "./conversions";

export class NodeServer implements Server {
    private constructor(private readonly server: node.Server, public readonly uri: ParsedUri) {
    }

    static async start(handler: HttpHandler | HttpHandlerFn, {port = 0} = {}): Promise<NodeServer> {
        const httpHandler = typeof handler === 'function' ? handlers.handler(handler) : handler;
        const server = node.createServer(adapter(httpHandler));
        server.listen(port);
        const uri = await new Promise<ParsedUri>((resolve) => {
            server.on('listening', () => {
                const address: string | any = server.address();
                resolve(Uri.parse(`http://localhost:${typeof address === 'string' ? port : address.port}/`))
            })
        });
        return new NodeServer(server, uri);
    }

    close(): Promise<void> {
        return new Promise<void>(resolve => {
            this.server.close(function () {
                resolve();
            });
        });
    }

    async url(): Promise<ParsedUri> {
        return this.uri;
    }
}

export function adapter(handler: HttpHandler) {
    return (nodeRequest: node.IncomingMessage, nodeResponse: node.ServerResponse) => {
        try {
            const req = requestNodeToHttp4t(nodeRequest);
            (async () => {
                try {
                    const response = await handler.handle(req);
                    await responseHttp4tToNode(response, nodeResponse);
                } catch (e) {
                    nodeResponse.end()
                }
            })();
        } catch (e) {
            nodeResponse.end();
        }
    };
}
