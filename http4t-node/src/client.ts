import * as node from 'http';
import { requestHttp4tToNode, responseNodeToHttp4t } from "./conversions";
import { bodyToStream } from "./streams";
import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";

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


