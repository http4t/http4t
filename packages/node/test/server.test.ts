import {handlerContract} from "@http4t/core-test/handler.contract";
import {BinHandler} from "@http4t/core/bin";
import {HttpHandler} from "@http4t/core/contract";
import {filterRequest} from "@http4t/core/Filter";
import {ClientHandler} from "@http4t/node/client";
import {NodeServer} from "@http4t/node/server";

describe("ServerHandler", function () {
    let server: NodeServer;

    async function handler(): Promise<HttpHandler> {
        server = await NodeServer.start(new BinHandler())
        const url = await server.url();
        return filterRequest(request => ({
            ...request,
            uri: {...request.uri, authority: url.authority}
        }))(ClientHandler.defaultTo('http'));
    }

    handlerContract(handler());

    after(async function () {
        try {
            return server.close();
        } catch (ignore) {
            console.error("could not close node server", ignore);
        }
    });

});
