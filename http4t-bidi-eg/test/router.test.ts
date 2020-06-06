import { request } from "@http4t/core/requests";
import { HttpRequest } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { expect } from "chai";
import { HttpRequestWithCaptures, routes } from "../src/router";
import { bufferText } from "@http4t/core/bodies";

describe('router', () => {

  it('handles with first route that exactly matches path', async () => {
    const res = await routes(
      [request('GET', '/store'), async (_req: HttpRequest) => response(200, '/store')],
      [request('GET', '/test/store-then-throw'), async (_req: HttpRequest) => response(200, '/store-then-throw')]
    )
      .handle(request('GET', '/test/store-then-throw'));

    expect(res.status).eq(200);
    expect(res.body).eq('/store-then-throw');
  });

  it('handles with first route that matches method and path', async () => {
    const res = await routes(
      [request('GET', '/foo'), async (_req: HttpRequest) => response(200, 'GET')],
      [request('POST', '/foo'), async (_req: HttpRequest) => response(200, 'POST')]
    )
      .handle(request('POST', '/foo'));

    expect(res.status).eq(200);
    expect(res.body).eq('POST');
  });

  it('exposes uri template capture', async () => {
    const res = await routes(
      [request('GET', '/{name}/path/{regex:\\d+}'), async (_req: HttpRequestWithCaptures) => {
        return response(200, JSON.stringify(_req.path));
      }],
    )
      .handle(request('GET', '/tom/path/32145'));

    expect(res.status).eq(200);
    expect(JSON.parse(await bufferText(res.body))).eql({ name: 'tom', regex: '32145' });
  });

  it('404 if no match', async () => {
    const res = await routes([request('GET', '/foo'), async (req: HttpRequest) => response(200, req.body)])
      .handle(request('GET', '/bar'));

    expect(res.status).eq(404);
  });

});