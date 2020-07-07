import {responseOf} from "@http4t/core/responses";
import {Closeable} from "@http4t/core/server";
import {problem} from "@http4t/result/JsonPathResult";
import {expect} from "chai";
import {Api} from "../src/api";
import {testClient} from "./helpers";
import uuid = require("uuid");

async function error(f: () => any): Promise<any> {
    try {
        await f();
        return undefined
    } catch (e) {
        return e;
    }
}

describe('store', function () {
    this.timeout(2000);

    let client: Api & Closeable;

    before(async () => {
        client = await testClient();
    });

    after(async () => {
        await client?.close();
    });

    it('stores some json', async () => {
        const request = {
            id: uuid(),
            document: {name: 'Tom'}
        };

        expect(await client.post(request)).deep.eq({id: request.id});

        expect(await client.get({id: request.id})).deep.eq(request)
    });

    it('transactions roll back on error', async () => {
        const request = {
            id: uuid(),
            document: {name: 'Should not be created'}
        };

        const e = await error(async () => await client.test(request));
        expect(e).deep.contains(
            {
                actual: responseOf(500, "{\"message\":\"Deliberate error\"}"),
                problems: [problem("Status was not 200", ["response", "status"])]
            }
        );

        expect(await client.get({id: request.id})).eq(undefined)
    });
});