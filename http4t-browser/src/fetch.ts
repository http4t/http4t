import { Body, Header, HeaderName, HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { header } from "@http4t/core/headers";
import { response } from "@http4t/core/responses";
import { Uri } from "@http4t/core/uri";
import { bufferText, streamBinary } from "@http4t/core/bodies";

/**
 * Streams response body, but not request body.
 *
 * There is no streaming a fetch body yet. Accepted by WHATWG Jan 2017 https://github.com/whatwg/fetch/pull/425
 * and in the spec https://fetch.spec.whatwg.org/#bodies but not implemented in Chrome yet, at least, and not looking l
 * ike it will be for a while: https://bugs.chromium.org/p/chromium/issues/detail?id=688906
 */
export class FetchHandler implements HttpHandler {
  constructor(private readonly opts: Partial<Opts> = {}) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
        toFetchRequest(request, this.opts).then(fetchRequest =>
          fetch(fetchRequest)
            .then(fetchResponse => {
              resolve(toResponse(fetchResponse))
            })
            .catch(reject)
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

function readableStream(body: Body): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start: async controller => {
      try {
        for await(const chunk of streamBinary(body)) {
          controller.enqueue(chunk);
        }
      } catch (e) {
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
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    }
  };
}

const unsafeHeaders: HeaderName[] = ['content-length', 'host'];

export type Opts = Pick<RequestInit, 'mode' | 'cache' | 'redirect' | 'credentials' | 'referrer' | 'integrity'>;

const DEFAULT_OPTS: Opts = {
  referrer: "client",
  credentials: "omit",
  redirect: "manual",
  cache: "no-store",
  mode: "cors" // TODO: is this right?
};

function toFetchHeaders(request: HttpRequest) {
  return request.headers.reduce((headers, [n, v]) => {
    if (unsafeHeaders.indexOf(n.toLowerCase()) != -1) return headers;
    if (typeof v == 'undefined') return headers;
    headers.append(n, v);
    return headers
  }, new Headers());
}

async function toFetchRequest(request: HttpRequest, opts: Partial<Opts>): Promise<Request> {
  const headers = toFetchHeaders(request);

  return new Request(
    Uri.of(request.uri).toString(),
    {
      method: request.method,
      headers,
      ...(request.body ? { body: await bufferText(request.body) } : {}),//TODO: it would be good if this was streaming
      ...Object.assign({}, DEFAULT_OPTS, opts)
    });
}

function toResponse(fetchResponse: Response): HttpResponse {
  const headers: Header[] = [];
  fetchResponse.headers.forEach((n, v) => headers.push(header(n, v)));
  return response(
    fetchResponse.status,
    fromReadableStream(fetchResponse.body),
    ...headers);
}


