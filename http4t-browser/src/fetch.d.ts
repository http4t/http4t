import { HttpHandler, HttpRequest, HttpResponse } from "../../http4t-core/src/contract";
/**
 * Streams response body, but not request body.
 *
 * There is no streaming a fetch body yet. Accepted by WHATWG Jan 2017 https://github.com/whatwg/fetch/pull/425
 * and in the spec https://fetch.spec.whatwg.org/#bodies but not implemented in Chrome yet, at least, and not looking l
 * ike it will be for a while: https://bugs.chromium.org/p/chromium/issues/detail?id=688906
 */
export declare class FetchHandler implements HttpHandler {
    private readonly opts;
    constructor(opts?: Partial<Opts>);
    handle(request: HttpRequest): Promise<HttpResponse>;
}
export declare type Opts = Pick<RequestInit, 'mode' | 'cache' | 'redirect' | 'credentials' | 'referrer' | 'integrity'>;
