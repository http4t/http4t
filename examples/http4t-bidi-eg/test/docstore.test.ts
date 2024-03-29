import {JsonPathError} from "@http4t/result/JsonPathError";
import {problem} from "@http4t/result/JsonPathResult";
import chai from "chai";
import {CloseableHttpHandler, loggedInDocStore, startTestServer} from "./testsupport";
import uuidPkg from "uuid";
import {failure, success} from "@http4t/result";
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

    it('rolls back transactions on error', async () => {
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
            problem("Server threw an exception", ["request"], "storeDocThenFail")]);

        expect(await alice.get({id: request.id})).deep.eq(success(undefined))
    });

    it('does not allow users to view or edit docs they do not own', async function () {
        const aliceDocId = uuid();
        await alice.post({id: aliceDocId, document: {hello: "world"}})

        expect(await bob.get({id: aliceDocId})).deep.eq(success(undefined));
        expect(await bob.post({id: aliceDocId, document: {}})).deep.eq(failure({
            reason: "forbidden",
            message: "You do not own this document"
        }));
    });
});
