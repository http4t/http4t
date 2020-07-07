import {Closeable} from "@http4t/core/server";
import {expect} from "chai";
import {Api} from "../src/api";
import {testClient} from "./helpers";

describe('probe', function () {
    this.timeout(2000);

    let client: Api & Closeable;

    before(async () => {
        client = await testClient();
    });

    after(async () => {
        await client?.close();
    });

    it('ready', async () => {
        expect(await client.ready()).eq(undefined);
    });

    it('live', async () => {
        expect(await client.live()).eq(undefined);
    });
});