import {bufferText, streamBinary, typeDescription} from "@http4t/core/bodies";
import {HttpHandler} from "@http4t/core/contract";
import {HttpHandlerFn} from "@http4t/core/handlers";
import {header} from "@http4t/core/headers";
import {delete_, get, patch, post, put} from "@http4t/core/requests";
import chai from "chai";

const {assert} = chai;

export function handlerHttpsSmokeTest(httpHandler: (HttpHandler | Promise<HttpHandler>)) {
    const handle: HttpHandlerFn = async request => {
        return (await httpHandler).handle(request);
    }

    it("supports GET", async function () {
        const response = await handle(get('/get'));
        assert.equal(response.status, 200);
    });
}
export function handlerContract(httpHandler: (HttpHandler | Promise<HttpHandler>)) {
    const handle: HttpHandlerFn = async request => {
        return (await httpHandler).handle(request);
    }

    it("supports GET", async function () {
        const response = await handle(get('/get'));
        assert.equal(response.status, 200);
    });

    it("supports POST", async function () {
        const body = "Hello";
        const response = await handle(post('/post', body, header('Content-Length', body.length)));
        assert.equal(response.status, 200);

        const text = await bufferText(response.body);
        assert.equal(JSON.parse(text).data, body);
    });

    it("supports PUT", async function () {
        const body = "Hello";
        const response = await handle(put('/put', body, header('Content-Length', body.length)));
        assert.equal(response.status, 200);

        const text = await bufferText(response.body);
        assert.equal(JSON.parse(text).data, body);
    });

    it("supports PATCH", async function () {
        const body = "Hello";
        const response = await handle(patch('/patch', body, header('Content-Length', body.length)));
        assert.equal(response.status, 200);

        const text = await bufferText(response.body);
        assert.equal(JSON.parse(text).data, body);
    });

    it("supports DELETE", async function () {
        const response = await handle(delete_('/delete', header('Accept', "application/json")));
        assert.equal(response.status, 200);

        const json = JSON.parse(await bufferText(response.body));
        // In fetchAdapter(), fetch forces lower-casing of header names
        assert.equal(json.headers['Accept'] || json.headers['accept'], "application/json");
    });

    it("supports chunked binary", async function () {
        const response = await handle(get('/stream-bytes/10'));
        assert.equal(response.status, 200);

        for await (const chunk of streamBinary(response.body)) {
            assert.instanceOf(chunk, Uint8Array, `chunk was a ${typeDescription(chunk)}`);
            assert.equal((chunk).length, 10);
        }
    });
}
