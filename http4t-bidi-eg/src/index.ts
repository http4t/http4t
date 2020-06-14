import {ServerHandler} from "@http4t/node/server";
import {Pool} from "pg";
import {testDatabase} from "../test/db";
import {startApp} from "./App";
import {PostgresTransactionPool} from "./TransactionPool";

(async function main() {
    const router = await startApp(new PostgresTransactionPool(new Pool(testDatabase)));
    const server = new ServerHandler(router);
    console.log('Running on port', (await server.url()).authority);
})();