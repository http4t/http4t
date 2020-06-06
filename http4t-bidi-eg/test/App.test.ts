import {get} from "@http4t/core/requests";
import {ClientHandler} from "@http4t/node/client";
import {ServerHandler} from "@http4t/node/server";
import {expect} from "chai";
import {Pool} from "pg";
import {App} from "../src/App";
import {PostgresTransactionPool} from "../src/TransactionPool";
import {testDatabase} from "./db";

describe('probe', () => {
  const app = new App(new PostgresTransactionPool(new Pool(testDatabase)));
  const serverHandler = new ServerHandler(app);
  let baseUrl: string | undefined;

  before(async () => {
    await app.start();
    baseUrl = `${await serverHandler.url()}`;
  });

  after(async () => {
    await app.stop();
    await serverHandler.close();
  });

  it('ready', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}probe/ready`));
    expect(response.status).eq(200);
  });

  it('live', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}probe/live`));
    expect(response.status).eq(200);
  });
});