import {Buffered, HttpHandler, HttpRequest, HttpResponse, notFound, ok} from "../";
import {Uri} from "../uri";

export class BinHandler implements HttpHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    const uri = Uri.of(request);
    if (request.method === 'GET')
      if (uri.path === '/stream-bytes') {
        return this.streamBytes(Number.parseInt(uri.query || "0"));
      }
      else
        return ok();
    if (request.method === 'POST') return this.echo(request);
    if (request.method === 'PUT') return this.echo(request);
    if (request.method === 'PATCH') return this.echo(request);
    if (request.method === 'DELETE') return this.echo(request);

    return notFound();
  }

  async echo({uri, headers, body}: HttpRequest): Promise<HttpResponse> {
    const data = await (body ? Buffered.text(body) : undefined);

    return ok([], JSON.stringify({uri, data, headers}));
  }

  streamBytes(size: number): HttpResponse {
    async function* iterable() {
      yield randomBytes(size);
    }

    return ok([], iterable());
  }
}

function randomBytes(length: number) {
  const buffer = new Array<number>(Math.round(length / 4) + 1);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.random();
  }

  return new Uint8Array(Float32Array.from(buffer).buffer).slice(0, length);
}
