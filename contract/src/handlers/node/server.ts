import * as node from 'http';
import {
  HttpHandler,
  HttpRequest,
  HttpResponse, messageBody,
  ParsedUri,
  request, sendBodyToStream,
  Uri
} from "../../";
import {Server} from "../../server";
import {fromRawHeaders} from "./util";

export const adapter = (handler: HttpHandler) => (nodeRequest: node.IncomingMessage, nodeResponse: node.ServerResponse) => {
  const req = request(
    nodeRequest.method || "",
    nodeRequest.url || "",
    messageBody(nodeRequest),
    ...fromRawHeaders(nodeRequest.rawHeaders));

  (async () => {
    const response = await handler.handle(req);
    nodeResponse.statusCode = response.status;
    for (const [name, value] of response.headers) {
      if (value) nodeResponse.setHeader(name, value);
    }

    sendBodyToStream(response.body, nodeResponse);
  })();
};

export class ServerHandler implements Server {
  private server: node.Server;
  private uri: Promise<ParsedUri>;

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


