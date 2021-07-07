import {Header, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {authority, requestOf} from "@http4t/core/requests";
import {responseOf} from "@http4t/core/responses";
import * as node from 'http';
import {bodyToStream, streamToBody} from "./streams";


/*
-----------------------------------
Core functions
-----------------------------------
 */

export function requestHttp4tToNode(request: HttpRequest, defaultProtocol:'http'|'https'): node.RequestOptions {
    const uri = request.uri;
    const scheme = uri.scheme;
    const path = `${uri.path.startsWith("/") ? uri.path : `/${uri.path}`}${uri.query ? `?${uri.query}` : ''}`;
    const {host, port} = authority(request);
    // console.log({host,port,scheme,path});
    return {
        protocol: `${scheme || defaultProtocol}:`,
        method: request.method,
        hostname: host,
        port: port,
        path: path,
        headers: toOutgoingHeaders(request.headers)
    };
}


export function requestNodeToHttp4t(nodeRequest: node.IncomingMessage): HttpRequest {
    return requestOf(
        nodeRequest.method || "",
        nodeRequest.url || "",
        streamToBody(nodeRequest),
        ...fromRawHeaders(nodeRequest.rawHeaders));
}


export async function responseHttp4tToNode(response: HttpResponse, nodeResponse: node.ServerResponse): Promise<void> {
    nodeResponse.statusCode = response.status;
    for (const [name, value] of response.headers) {
        if (value) nodeResponse.setHeader(name, value);
    }

    await bodyToStream(response.body, nodeResponse);
}

export function responseNodeToHttp4t(nodeResponse: node.IncomingMessage): HttpResponse {
    return responseOf(
        nodeResponse.statusCode || -1,
        streamToBody(nodeResponse),
        ...fromRawHeaders(nodeResponse.rawHeaders));
}

/*
-----------------------------------
Helpers
-----------------------------------
 */

function toOutgoingHeaders(headers: readonly Header[]): node.OutgoingHttpHeaders {
    return headers.reduce((acc: node.OutgoingHttpHeaders, h: Header) => {
        const [n, v] = h;
        const existing: string | string[] | number | undefined = acc[n];
        if (!existing) {
            acc[n] = v;
        } else if (typeof existing === 'string' || typeof existing === 'number') {
            acc[n] = [existing.toString(), v];
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

