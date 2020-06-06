import {bufferText} from "@http4t/core/bodies";
import {get, post} from "@http4t/core/requests";
import {ClientHandler} from "@http4t/node/client";
import {ServerHandler} from "@http4t/node/server";
import {expect} from "chai";
import {Pool} from "pg";
import {App} from "../src/App";
import {PostgresTransactionPool} from "../src/TransactionPool";
import {testDatabase} from "./db";

describe('store', function () {
  this.timeout(2000);

  const pool = new PostgresTransactionPool(new Pool(testDatabase));
  const app = new App(pool);
  const serverHandler = new ServerHandler(app);
  let baseUrl:string | undefined;

  before(async () => {
    await app.start();
    baseUrl = `${await serverHandler.url()}`;
  });

  after(async () => {
    await app.stop();
    await serverHandler.close();
  });

  it('stores some json', async () => {
    const client = new ClientHandler();
    const id = 'id' + (Math.random() * 10000).toString().slice(0, 3);
    const body = JSON.stringify({id: id, document: {name: 'Tom'}});

    const create = await client.handle(post(`${baseUrl}store`, body));
    const returnedId = await bufferText(create.body);
    expect(returnedId).eq(id);

    const retrieve = await client.handle(get(`${baseUrl}store/${returnedId}`));
    expect(await bufferText(retrieve.body)).eq(body)
  });

  it('transactions roll back on error', async () => {
    const client = new ClientHandler();
    const id = 'id' + (Math.random() * 10000).toString().slice(0, 3);
    const body = JSON.stringify({id: id, document: {name: 'Should not be created'}});

    const failed = await client.handle(post(`${baseUrl}test/store-then-throw`, body));
    expect(failed.status).eq(500);

    const retrieve = await client.handle(get(`${baseUrl}store/${id}`));
    expect(retrieve.status).eq(404)
  });
});