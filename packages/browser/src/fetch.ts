import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {
    SupportedRequestInitFields,
    toFetchRequest,
    toFetchResponse,
    toHttp4tRequest,
    toHttp4tResponse
} from "./conversions";

export type Opts = {
    readonly fetch: typeof fetch,
    readonly requestInit?: SupportedRequestInitFields
};

export const DEFAULT_OPTS: Opts = {
    fetch: fetch,
}

/**
 * Streams response body, but not request body.
 *
 * There is no streaming a fetch body yet. Accepted by WHATWG Jan 2017 https://github.com/whatwg/fetch/pull/425
 * and in the spec https://fetch.spec.whatwg.org/#bodies but not implemented in Chrome yet, at least, and not looking l
 * ike it will be for a while: https://bugs.chromium.org/p/chromium/issues/detail?id=688906
 */
export class FetchHandler implements HttpHandler {
    private opts: Opts;

    constructor(opts: Partial<Opts> = {}) {
        this.opts = Object.assign({}, DEFAULT_OPTS, opts);
    }

    handle(request: HttpRequest): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
                toFetchRequest(request, this.opts.requestInit)
                    .then(this.opts.fetch)
                    .then(fetchResponse =>
                        resolve(toHttp4tResponse(fetchResponse))
                    ).catch(reject)
            }
        );
    }
}


/**
 * Returns an implementation of fetch that goes straight to an HttpHandler, which could be in-process or over the network
 *
 *
 */
export function fetchAdapter(handler: HttpHandler): typeof fetch {
    return async (input: Request | string | URL, init: RequestInit | undefined): Promise<Response> => {
        const http4tRequest = toHttp4tRequest(input, init);

        const http4tResponse = await handler.handle(http4tRequest);

        return toFetchResponse(http4tResponse);
    };
}