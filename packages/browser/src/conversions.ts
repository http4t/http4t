import {Header, HeaderName, HttpBody, HttpRequest, HttpResponse, Method} from "@http4t/core/contract";
import {Uri} from "@http4t/core/uri";
import {bufferText} from "@http4t/core/bodies";
import {header} from "@http4t/core/headers";
import {responseOf} from "@http4t/core/responses";
import {requestOf} from "@http4t/core/requests";
import {bodyToReadableStream, readableStreamToBody} from "./bodies";

export type SupportedRequestInitFields = Readonly<Pick<RequestInit, 'mode' | 'cache' | 'redirect' | 'credentials' | 'referrer' | 'integrity'>>;

export function fromReadableStream(stream: ReadableStream<Uint8Array> | null): AsyncIterable<Uint8Array> | string {
    if (!stream)
        return "";

    return {
        [Symbol.asyncIterator]: async function* () {
            const reader = stream.getReader();
            while (true) {
                const {done, value} = await reader.read();
                if (value) yield value;
                if (done) return;
            }
        }
    };
}

export const unsafeHeaders: readonly HeaderName[] = ['content-length', 'host'];

export function toFetchHeaders(request: HttpRequest) {
    return request.headers.reduce((headers, [n, v]) => {
        if (unsafeHeaders.indexOf(n.toLowerCase()) != -1) return headers;
        if (typeof v == 'undefined') return headers;
        headers.append(n, v);
        return headers
    }, new Headers());
}

export async function toFetchRequest(request: HttpRequest, opts?: SupportedRequestInitFields): Promise<Request> {
    const uri = Uri.of(request.uri).toString();
    const url = request.uri.authority && !request.uri.scheme ? `https:${uri}` : uri;
    const headers = toFetchHeaders(request);
    const body = request.body ? {body: await bufferText(request.body)} : {};
    opts = Object.assign({}, opts);
    return new Request(
        url,
        {
            method: request.method,
            headers,
            ...body, //TODO: it would be good if this was streaming
            ...opts
        });
}

export function toHttp4tResponse(fetchResponse: Response): HttpResponse {
    const headers: Header[] = [];
    fetchResponse.headers.forEach((n, v) => headers.push(header(n, v)));
    return responseOf(
        fetchResponse.status,
        fromReadableStream(fetchResponse.body),
        ...headers);
}

export function isFetchRequest(value: Request | string | URL): value is Request {
    return typeof value !== "string"
        && "method" in value;
}

export function http4tHeaders(headers: Headers): Header[] {
    return Array.from(headers.entries());
}

export function toFetchResponse(http4tResponse: HttpResponse): Response {
    return new Response(
        bodyToReadableStream(http4tResponse.body),
        {
            status: http4tResponse.status,
            headers: http4tResponse.headers.map(h => [...h]),
            statusText: http4tResponse.statusDescription
        });
}

export function toHttp4tRequest(input: Request | string | URL, init: RequestInit | undefined) {
    const method: Method =
        isFetchRequest(input)
            ? input.method
            : "GET"

    const url: string =
        typeof input === "string"
            ? input
            : isFetchRequest(input)
            ? input.url
            : input.toString();

    // TODO: implement me
    if (init) throw new Error(`RequestInit not yet supported in fetchAdapter() for ${method} ${url}`);

    const headers: Header[] =
        isFetchRequest(input)
            ? http4tHeaders(input.headers)
            : [];

    const body: HttpBody | undefined =
        isFetchRequest(input)
            ? input.body
            ? readableStreamToBody(input.body)
            : undefined
            : [];

    return requestOf(method, url, body, ...headers);
}