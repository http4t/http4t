import {buildClient} from "@http4t/bidi/client";
import {Closeable} from "@http4t/core/server";
import {ServerHandler} from "@http4t/node/server";
import {Pool} from "pg";
import {Api, routes} from "../src/api";
import {startApp} from "../src/App";
import {PostgresTransactionPool} from "../src/TransactionPool";
import {testDatabase} from "./db";
import {DockerPgTransactionPool} from "./DockerPgTransactionPool";

/**
 * Spins up a new server and returns an Api that talks to that server,
 * with an additional close() method which spins down the server.
 */
export async function testClient(): Promise<Api & Closeable> {
    const router = await startApp(new DockerPgTransactionPool(new PostgresTransactionPool(new Pool(testDatabase))));
    const server = new ServerHandler(router);
    const client = buildClient(routes, server)
    return {
        ...client, async close(): Promise<void> {
            console.log("Closing TestContext...");
            await server.close();
            console.log("Server closed");
            await router.close();
            console.log("Transaction pool closed");

        }
    };
}
