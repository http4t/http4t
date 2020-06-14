import {Authority} from "@http4t/core/uri";
import {runningInNode} from "./client.test";
import {Server} from "@http4t/core/server";
import {BinHandler} from "@http4t/core/bin";
import {handlerContract} from "@http4t/core-test/handler.contract";

describe("ServerHandler", function () {
    let server = new Promise<Server>(async (resolve, reject) => {
            if (!runningInNode())
                resolve(null as any);
            try {
                const {ServerHandler} = await import('../src/server');
                resolve(new ServerHandler(new BinHandler()));
            } catch (e) {
                reject(e);
            }
        })
    ;

    before(async function () {
        if (!runningInNode()) this.skip();

    });

    async function host(): Promise<string> {
        const s = await server;
        const url = await s.url();
        if (url.authority) return Authority.of(url.authority).toString();
        throw new Error("Should never get here");
    }

    handlerContract(async () => {
            if (!runningInNode()) throw new Error("Unsupported");

            const {ClientHandler} = await import('../src/client');
            return new ClientHandler();
        },
        runningInNode() ? host() : null as any);

    after(async function () {
        try {
            return (await server).close();
        } catch (ignore) {
        }
    });
});