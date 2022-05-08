import {expect} from "chai";
import {CloseableHttpHandler, startTestServer} from "./testsupport";
import {Health, healthClient} from "@http4t/bidi-eg/api";

describe('health', function () {
    this.timeout(30000);

    let server: CloseableHttpHandler;
    let client: Health;

    before(async () => {
        server = await startTestServer();
        client = healthClient(server);
    });

    after(async () => {
        await server.close();
    });

    it('ready', async () => {
        expect(await client.ready()).eq(undefined);
    });

    it('live', async () => {
        expect(await client.live()).eq(undefined);
    });
});
