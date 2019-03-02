import {streamBinary} from "../../bodies";
import {Body, Header, HeaderName, HttpHandler, HttpRequest, HttpResponse} from "../../contract";
import {header} from "../../headers";
import {host} from "../../requests";
import {response} from "../../responses";
import {Uri} from "../../uri";

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
        const {done, value} = await reader.read();
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

function toFetchRequest(request: HttpRequest, opts: Partial<Opts>): Request {
  const headers = request.headers.reduce((headers, [n, v]) => {
    if (unsafeHeaders.indexOf(n.toLowerCase()) != -1) return headers;
    if (typeof v == 'undefined') return headers;
    headers.append(n, v);
    return headers
  }, new Headers());

  return new Request(
    Uri.of(request.uri).toString(),
    {
      method: request.method,
      headers,
      ...(request.body ? {body: readableStream(request.body)} : {}),
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


export class FetchHandler implements HttpHandler {
  constructor(private readonly opts: Partial<Opts> = {}) {
  }

  handle(request: HttpRequest): Promise<HttpResponse> {
    return new Promise<HttpResponse>((resolve, reject) => {
        const fetchRequest = toFetchRequest(request, this.opts);

        fetch(fetchRequest)
          .then(fetchResponse => {
            resolve(toResponse(fetchResponse))
          })
          .catch(reject)
      }
    );
  }
}
