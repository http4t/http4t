import {HttpHandler, ParsedUri} from "@http4t/core/contract";
import {Server} from "@http4t/core/server";
import {Uri} from "@http4t/core/uri";
import {deleteMeLog} from "@http4t/core/util/logging";
import * as node from 'http';
import {requestNodeToHttp4t, responseHttp4tToNode} from "./conversions";

export class NodeServer implements Server {
    private constructor(private readonly server: node.Server, public readonly uri: ParsedUri) {
    }

    static async start(handler: HttpHandler, {port = 0} = {}): Promise<NodeServer> {
        const server = node.createServer(adapter(handler));
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
        deleteMeLog("NodeServer", "reached server");
        try {
            deleteMeLog("NodeServer", "nodeRequest", nodeRequest);
            const req = requestNodeToHttp4t(nodeRequest);
            deleteMeLog("NodeServer", "HttpRequest", req);
            (async () => {
                try {
                    const response = await handler.handle(req);
                    await responseHttp4tToNode(response, nodeResponse);
                } catch (e) {
                    deleteMeLog("NodeServer", "handler exception", e);
                    nodeResponse.end()
                }
            })();
        } catch (e) {
            deleteMeLog("NodeServer", "exception", e);
            nodeResponse.end();
        }
    };
}