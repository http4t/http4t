import {Api, routes} from "@http4t/bidi-eg/api";
import {startApp} from "@http4t/bidi-eg/App";
import {PostgresTransactionPool} from "@http4t/bidi-eg/TransactionPool";
import {buildClient} from "@http4t/bidi/client";
import {HttpHandler} from "@http4t/core/contract";
import {filterRequest} from "@http4t/core/Filter";
import {Closeable} from "@http4t/core/server";
import {deleteMeLog} from "@http4t/core/util/logging";
import {ClientHandler} from "@http4t/node/client";
import {NodeServer} from "@http4t/node/server";
import {Pool} from "pg";
import {testDatabase} from "./db";
import {DockerPgTransactionPool} from "./DockerPgTransactionPool";

export type CloseableClient<T> = T & Closeable & { port: number | undefined };

/**
 * Spins up a new server and returns an Api that talks to that server,
 * with an additional close() method which spins down the server.
 */
export async function testClient(): Promise<CloseableClient<Api>> {
    const router = await startApp(new DockerPgTransactionPool(new PostgresTransactionPool(new Pool(testDatabase))));
    const server = await NodeServer.start(router);
    const url = await server.url();
    deleteMeLog("testClient", "server url", url);
    const http: HttpHandler = filterRequest(r => ({
        ...r,
        uri: {...r.uri, authority: url.authority}
    }))(ClientHandler.defaultTo('http'));

    const client: Api = buildClient(routes, http, {leakActualValuesInError: true});
    return {
        ...client,
        port: url.authority?.port,
        async close(): Promise<void> {
            console.log("Closing TestContext...");
            await server.close();
            console.log("Server closed");
            await router.close();
            console.log("Transaction pool closed");
        }
    };
}
