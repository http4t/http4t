import * as node from 'http';
import {Readable, Writable} from 'stream';
import {Header, HttpRequest, HttpResponse} from "../../contract";
import {host, request} from "../../requests";
import {response} from "../../responses";
import {streamToBody, bodyToStream} from "./streams";


/*
-----------------------------------
Core functions
-----------------------------------
 */

export function requestHttp4tToNode(request: HttpRequest): node.RequestOptions {
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


export function requestNodeToHttp4t(nodeRequest: node.IncomingMessage): HttpRequest {
  return request(
    nodeRequest.method || "",
    nodeRequest.url || "",
    streamToBody(nodeRequest),
    ...fromRawHeaders(nodeRequest.rawHeaders));
}


export function responseHttp4tToNode(response: HttpResponse, nodeResponse: node.ServerResponse) {
  nodeResponse.statusCode = response.status;
  for (const [name, value] of response.headers) {
    if (value) nodeResponse.setHeader(name, value);
  }

  bodyToStream(response.body, nodeResponse);
}

export function responseNodeToHttp4t(nodeResponse: node.IncomingMessage): HttpResponse {
  return response(
    nodeResponse.statusCode || -1,
    streamToBody(nodeResponse),
    ...fromRawHeaders(nodeResponse.rawHeaders));
}

/*
-----------------------------------
Helpers
-----------------------------------
 */

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

function fromRawHeaders(rawHeaders: string[]): Header[] {
  if (rawHeaders.length == 0) return [];
  const [name, value, ...remainder] = rawHeaders;
  return [[name, value], ...fromRawHeaders(remainder)];
}

