import {Buffer, HttpHandler, HttpRequest, HttpResponse, notFound, ok} from "../";
import {Uri} from "../uri";

export class BinHandler implements HttpHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    const {method, uri: {path, query}} = request;

    if (method === 'GET' && path === '/stream-bytes') return this.streamBytes(Number.parseInt(query || "0"));
    if (method === 'GET') return ok();
    if (method === 'POST') return this.echo(request);
    if (method === 'PUT') return this.echo(request);
    if (method === 'PATCH') return this.echo(request);
    if (method === 'DELETE') return this.echo(request);

    return notFound();
  }

  async echo({uri, headers, body}: HttpRequest): Promise<HttpResponse> {
    const data = await (body ? Buffer.text(body) : undefined);

    return ok([], JSON.stringify({uri, data, headers}));
  }

  streamBytes(size: number): HttpResponse {
    async function* iterable() {
      yield randomBytes(size);
    }

    return ok([], iterable());
  }
}

function randomBytes(size: number): Uint8Array {
  const sizeInFloats = Math.round(size / 4) + 1;
  const randomFloats = new Array<number>(sizeInFloats);

  for (let i = 0; i < randomFloats.length; i++) randomFloats[i] = Math.random();

  const buffer: ArrayBufferLike = Float32Array.from(randomFloats).buffer;
  return new Uint8Array(buffer).slice(0, size);
}
