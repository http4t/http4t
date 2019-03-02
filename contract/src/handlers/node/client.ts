import * as node from 'http';

import {Header, host, HttpHandler, HttpRequest, HttpResponse, messageBody, sendBodyToStream} from '../../';

export function fromRawHeaders(rawHeaders: string[]): Header[] {
  if (rawHeaders.length == 0) return [];
  const [name, value, ...remainder] = rawHeaders;
  return [[name, value], ...fromRawHeaders(remainder)];
}

function toOutgoingHeaders(headers: Header[]): node.OutgoingHttpHeaders {
  return headers.reduce((acc: node.OutgoingHttpHeaders, h: Header) => {
    const [n, v] = h;
    const existing: string | string[] | number | undefined = acc[n];
    if (!existing) {
      acc[n] = v;
    } else if (typeof existing === 'string') {
      acc[n] = [existing, v];
    } else {
      acc[n] = [...existing, v];
    }
    return acc;
  }, {});
}

function toNodeOpts(request: HttpRequest): node.RequestOptions {
  const [hostname, port = 80] = host(request).split(':');
  const uri = request.uri;
  return {
    method: request.method,
    path: `${uri.path}${uri.query ? `?${uri.query}` : ''}`,
    hostname: hostname,
    port: port,
    headers: toOutgoingHeaders(request.headers)
  };
}


export class ClientHandler implements HttpHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    return new Promise<HttpResponse>(resolve => {
        const responseHandler = (nodeResponse: node.IncomingMessage) => {
          resolve({
            status: nodeResponse.statusCode || -1,
            headers: fromRawHeaders(nodeResponse.rawHeaders),
            body: messageBody(nodeResponse)
          });
        };
        const nodeRequest = node.request(toNodeOpts(request), responseHandler);
        sendBodyToStream(request.body, nodeRequest);
      }
    );
  }
}


