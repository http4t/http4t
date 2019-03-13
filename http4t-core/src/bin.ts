import {Random} from "./random";
import {HttpHandler, HttpRequest, HttpResponse} from "./contract";
import {notFound, ok} from "./responses";
import {bufferText} from "./bodies";

/**
 * Represents an in memory version of http://httpbin.org/
 */
export class BinHandler implements HttpHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    const {method, uri: {path, query}} = request;

    if (method === 'GET' && path.startsWith('/stream-bytes')) {
      const match = /\/stream-bytes\/(.+)/.exec(path);
      return this.streamBytes(Number.parseInt((match && match[1])||"12"));
    }
    if (method === 'GET') return ok();
    if (method === 'POST') return BinHandler.echo(request);
    if (method === 'PUT') return BinHandler.echo(request);
    if (method === 'PATCH') return BinHandler.echo(request);
    if (method === 'DELETE') return BinHandler.echo(request);

    return notFound();
  }

  static async echo({uri, headers, body}: HttpRequest): Promise<HttpResponse> {
    // TODO convert headers to object instead of array
    const jsonedHeaders = headers.reduce((acc: any, [n, v]) => {
      acc[n] = v;
      return acc;
    }, {});
    return ok(JSON.stringify({data: await bufferText(body), headers:jsonedHeaders}));
  }

  streamBytes(size: number): HttpResponse {
    return ok((async function* () {
      yield Random.bytes(size);
    })());
  }
}


