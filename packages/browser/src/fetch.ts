import {bufferText, streamBinary} from "@http4t/core/bodies";
import {Header, HeaderName, HttpBody, HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {header} from "@http4t/core/headers";
import {responseOf} from "@http4t/core/responses";
import {Uri} from "@http4t/core/uri";

export type Opts = Readonly<Pick<RequestInit, 'mode' | 'cache' | 'redirect' | 'credentials' | 'referrer' | 'integrity'>>;

/**
 * Streams response body, but not request body.
 *
 * There is no streaming a fetch body yet. Accepted by WHATWG Jan 2017 https://github.com/whatwg/fetch/pull/425
 * and in the spec https://fetch.spec.whatwg.org/#bodies but not implemented in Chrome yet, at least, and not looking l
 * ike it will be for a while: https://bugs.chromium.org/p/chromium/issues/detail?id=688906
 */
export class FetchHandler implements HttpHandler {
    constructor(private readonly opts: Opts = {}) {
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
                toFetchRequest(request, this.opts)
                    .then(fetch)
                    .then(fetchResponse =>
                        resolve(toResponse(fetchResponse))
                    ).catch(reject)
            }
        );
    }
}

/*
-----------------------------------
Helpers
-----------------------------------
 */

export function readableStream(body: HttpBody): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
        start: async controller => {
            try {
                for await(const chunk of streamBinary(body)) {
                    controller.enqueue(chunk);
                }
            } catch (e: any) {
                controller.error(e);
            } finally {
                controller.close();
            }
        }
    });
}

function fromReadableStream(stream: ReadableStream<Uint8Array> | null): AsyncIterable<Uint8Array> | string {
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

const unsafeHeaders: HeaderName[] = ['content-length', 'host'];


function toFetchHeaders(request: HttpRequest) {
    return request.headers.reduce((headers, [n, v]) => {
        if (unsafeHeaders.indexOf(n.toLowerCase()) != -1) return headers;
        if (typeof v == 'undefined') return headers;
        headers.append(n, v);
        return headers
    }, new Headers());
}

async function toFetchRequest(request: HttpRequest, opts: Opts): Promise<Request> {
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

function toResponse(fetchResponse: Response): HttpResponse {
    const headers: Header[] = [];
    fetchResponse.headers.forEach((n, v) => headers.push(header(n, v)));
    return responseOf(
        fetchResponse.status,
        fromReadableStream(fetchResponse.body),
        ...headers);
}


