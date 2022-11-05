import {JsonPathError} from "@http4t/result/JsonPathError";
import {problem} from "@http4t/result/JsonPathResult";
import chai from "chai";
import {CloseableHttpHandler, loggedInDocStore, startTestServer} from "./testsupport";
import uuidPkg from "uuid";
import {success} from "@http4t/result";
import {DocStore} from "@http4t/bidi-eg-client/docstore";

const {expect} = chai;
const {v4: uuid} = uuidPkg;

async function error(f: () => any): Promise<any> {
    try {
        await f();
        return undefined
    } catch (e: any) {
        return e;
    }
}

describe('store', function () {
    this.timeout(30000);

    let server: CloseableHttpHandler;
    let alice: DocStore;
    let bob: DocStore;

    before(async () => {
        server = await startTestServer();
        alice = await loggedInDocStore(server, {userName: "Alice"});
        bob = await loggedInDocStore(server, {userName: "Bob"});
    });

    after(async () => {
        if (server) await server.close();
    });

    it('returns undefined when getting a nonexistent resource', async () => {
        expect(await alice.get({id: uuid()})).deep.eq(success(undefined))
    });

    it('stores some json', async () => {
        const doc = {
            id: uuid(),
            document: {name: 'Tom'}
        };
        expect(await alice.post(doc)).deep.eq(success({id: doc.id}));

        expect(await alice.get({id: doc.id})).deep.eq(success(doc))
    });

    it('transactions roll back on error', async () => {
        const request = {
            id: uuid(),
            document: {name: 'Should not be created'}
        };

        const e: JsonPathError = await error(() => alice.storeDocThenFail(request));

        expect(e.actual.response).deep.contains({
            status: 500
        });
        expect(e.message).match(/Deliberate error/);
        expect(e.problems).deep.eq([
            problem("Status was not 200", ["response", "status"], "storeDocThenFail"),
            problem("Status was not in 401, 403", ["response", "status"], "storeDocThenFail")]);

        // expected should be actual, with the json path of each problem replaced with the message(s)
        expect(e.expected.response).deep.contains({
                status: [
                    "Status was not 200",
                    "Status was not in 401, 403"
                ]
            }
        );

        expect(await alice.get({id: request.id})).deep.eq(success(undefined))
    });

    it('cannot edit docs I do not own', async function () {
        const aliceDocId = uuid();
        await alice.post({id: aliceDocId, document: {hello: "world"}})
        expect(await bob.get({id: aliceDocId})).deep.eq(success(undefined));
    });
});
