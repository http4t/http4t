import * as node from 'http';
import {requestNodeToHttp4t, responseHttp4tToNode} from "./conversions";
import {Server} from "@http4t/core/server";
import {HttpHandler, HttpRequest, HttpResponse, ParsedUri} from "@http4t/core/contract";
import {Uri} from "@http4t/core/uri";

export class ServerHandler implements Server {
  private readonly server: node.Server;
  private readonly uri: Promise<ParsedUri>;

  constructor(private handler: HttpHandler, {port = 0} = {}) {
    const server = node.createServer(adapter(this));
    this.server = server;
    this.server.listen(port);
    this.uri = new Promise<ParsedUri>((resolve) => {
      server.on('listening', () => {
        const address: string | any = server.address();
        resolve(Uri.parse(`http://localhost:${typeof address === 'string' ? port : address.port}/`))
      })
    })
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return this.handler.handle(request);
  }

  close(): Promise<void> {
    return new Promise<void>(resolve => {
      this.server.close(function () {
        resolve();
      });
    });
  }

  url(): Promise<ParsedUri> {
    return this.uri;
  }
}

export const adapter = (handler: HttpHandler) => (nodeRequest: node.IncomingMessage, nodeResponse: node.ServerResponse) => {
  const req = requestNodeToHttp4t(nodeRequest);
  (async () => {
    const response = await handler.handle(req);
    responseHttp4tToNode(response, nodeResponse);
  })();
};
