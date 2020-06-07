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
import uuid = require("uuid");

async function error(f: () => any): Promise<any> {
  try {
    await f();
    return undefined
  } catch (e) {
    return e;
  }
}

describe('store', function () {
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

  it('stores some json', async () => {
    const request = {
      id: uuid(),
      document: {name: 'Tom'}
    };

    expect(await client.post(request)).deep.eq({id: request.id});

    expect(await client.get({id: request.id})).deep.eq(request)
  });

  it('transactions roll back on error', async () => {
    const request = {
      id: uuid(),
      document: {name: 'Should not be created'}
    };

    const e = await error(async () => await client.test(request));
    expect(e).deep.eq({
      "type": "wrong-route",
      "message": "Status was not 200"
    });

    expect(await client.get({id: request.id})).eq(undefined)
  });
});