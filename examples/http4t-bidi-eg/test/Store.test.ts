import {Api} from "@http4t/bidi-eg/api";
import {JsonPathError} from "@http4t/result/JsonPathError";
import {problem} from "@http4t/result/JsonPathResult";
import {expect} from "chai";
import {CloseableClient, testClient} from "./helpers";
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
    this.timeout(30000);

    let client: CloseableClient<Api>;

    before(async () => {
        client = await testClient();
    });

    it('returns undefined when getting a nonexistent resource', async () => {
        const request = {
            id: uuid(),
            document: {name: 'Tom'}
        };
        expect(await client.get({id: request.id})).deep.eq(undefined)
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

        const e: JsonPathError = await error(() => client.test(request));

        expect(e.actual.response).deep.contains({
            status: 500,
            body: "Deliberate error"
        });
        expect(e.problems).deep.eq([
            problem("Status was not 200", ["response", "status"])]);

        // expected should be actual, with the json path of each problem replaced with the message(s)
        expect(e.expected.response).deep.contains({
                status: "Status was not 200"
            }
        );

        expect(await client.get({id: request.id})).eq(undefined)
    });
});
