import {ServerHandler} from "@http4t/node/server";
import {Pool} from "pg";
import {App} from "./app";
import {PostgresTransactionPool} from "./TransactionPool";

(async function main() {
  const pool = new PostgresTransactionPool(new Pool({}));
  const app = new App(pool);
  await app.start();
  const server = new ServerHandler(app);
  console.log('Running on port', (await server.url()).authority);
})();