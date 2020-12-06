import {NodeServer} from "@http4t/node/server";
import {Pool} from "pg";
import {startApp} from "./App";
import {PostgresTransactionPool} from "./TransactionPool";

(async function main() {
    const router = await startApp(new PostgresTransactionPool(new Pool(
        {database: "bidi-example", user: "bidi-example", password: "password"}
    )));
    const server = await NodeServer.start(router);
    console.log('Running on port', (await server.url()).authority);
})();
