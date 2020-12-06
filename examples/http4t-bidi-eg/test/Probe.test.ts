import {Closeable} from "@http4t/core/server";
import {expect} from "chai";
import {Api} from "@http4t/bidi-eg/api";
import {testClient} from "./helpers";

describe('probe', function () {
    this.timeout(10000);

    let client: Api & Closeable;

    before(async () => {
        client = await testClient();
    });

    it('ready', async () => {
        expect(await client.ready()).eq(undefined);
    });

    it('live', async () => {
        expect(await client.live()).eq(undefined);
    });

    after(async () => {
        await client?.close();
    });
});
