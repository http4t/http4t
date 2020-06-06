import {buildClient} from "@http4t/bidi/client";
import {HttpHandler} from "@http4t/core/contract";
import {Closeable} from "@http4t/core/server";
import {ServerHandler} from "@http4t/node/server";
import {expect} from "chai";
import {Pool} from "pg";
import {Api, routes} from "../src/api";
import {startApp} from "../src/App";
import {PostgresTransactionPool} from "../src/TransactionPool";
import {testDatabase} from "./db";

describe('probe', function () {
  this.timeout(2000);

  let router: HttpHandler & Closeable;
  let server: ServerHandler;
  let client: Api;

  before(async () => {
    router = await startApp(new PostgresTransactionPool(new Pool(testDatabase)));
    server = new ServerHandler(router);
    client = buildClient(routes, server)
  });

  after(async () => {
    console.log("Closing...");
    await server.close();
    console.log("Server closed");
    await router.close();
    console.log("Transaction pool closed");
  });

  it('ready', async () => {
    expect(await client.ready()).eq(undefined);
  });

  it('live', async () => {
    expect(await client.live()).eq(undefined);
  });
});