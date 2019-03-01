import {Bodies, HttpHandler, HttpRequest, HttpResponse, ok} from "../";

export class BinHandler implements HttpHandler {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    if(request.method === 'GET') return Promise.resolve(ok());
    if(request.method === 'POST') return this.echo(request);
  }

  async echo({uri, headers, body}: HttpRequest): Promise<HttpResponse> {
    const data = await (body ? Bodies.text(body) : undefined);
    return JSON.stringify({uri, data, headers});

    return ok([], await
  }
}

