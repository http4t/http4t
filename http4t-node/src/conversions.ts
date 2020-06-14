import {Header, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {authority, request} from "@http4t/core/requests";
import {response} from "@http4t/core/responses";
import * as node from 'http';
import {bodyToStream, streamToBody} from "./streams";


/*
-----------------------------------
Core functions
-----------------------------------
 */

export function requestHttp4tToNode(request: HttpRequest): node.RequestOptions {
    const {host, port = 80} = authority(request);
    const uri = request.uri;
    return {
        method: request.method,
        path: `${uri.path}${uri.query ? `?${uri.query}` : ''}`,
        hostname: host,
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

