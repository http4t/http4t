import {assert} from 'chai';
import {bufferText, delete_, get, header, HostHandler, HttpHandler, patch, post, put, typeDescription} from "../../src";

export function handlerContract(factory: () => Promise<HttpHandler>, host = Promise.resolve("eu.httpbin.org")) {
  before(async function () {
    try {
      const handler = await factory();
      this.handler = new HostHandler(handler, await host);
    } catch (e) {
      this.skip();
    }
  });

  it("supports GET", async function () {
    const response = await this.handler.handle(get('/get'));
    assert.equal(response.status, 200);
  });

  it("supports POST", async function () {
    const body = "Hello";
    const response = await this.handler.handle(post('/post', body, header('Content-Length', body.length)));
    assert.equal(response.status, 200);

    const text = await bufferText(response.body);
    assert.equal(JSON.parse(text).data, body);
  });

  it("supports PUT", async function () {
    const body = "Hello";
    const response = await this.handler.handle(put('/put', body, header('Content-Length', body.length)));
    assert.equal(response.status, 200);

    const text = await bufferText(response.body);
    assert.equal(JSON.parse(text).data, body);
  });

  it("supports PATCH", async function () {
    const body = "Hello";
    const response = await this.handler.handle(patch('/patch', body, header('Content-Length', body.length)));
    assert.equal(response.status, 200);

    const text = await bufferText(response.body);
    assert.equal(JSON.parse(text).data, body);
  });

  it("supports DELETE", async function () {
    const response = await this.handler.handle(delete_('/delete', header('Accept', "application/json")));
    assert.equal(response.status, 200);

    const json = JSON.parse(await bufferText(response.body));
    assert.equal(json.headers['Accept'], "application/json");
  });

  it("supports chunked binary", async function () {
    const response = await this.handler.handle(get('/stream-bytes/10'));
    assert.equal(response.status, 200);

    for await (const chunk of response.body) {
      assert.instanceOf(chunk, Uint8Array, `chunk was a ${typeDescription(chunk)}`);
      assert.equal(chunk.length, 10);
    }
  });
}
