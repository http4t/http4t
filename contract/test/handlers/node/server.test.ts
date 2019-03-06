import {assert} from 'chai';
import {BinHandler} from "../../../src/";

import {Server} from "../../../src/server";
import {handlerContract} from "../handler.contract";
import {runningInNode} from "./client.test";

describe("ServerHandler", function () {
  let server = new Promise<Server>(async (resolve, reject) => {
    if(!runningInNode())
      resolve(null as any);
    try {
      const {ServerHandler} = await import('../../../src');
      resolve(new ServerHandler(new BinHandler()));
    } catch (e) {
      reject(e);
    }
  })
  ;

  before(async function () {
    if (!runningInNode()) this.skip();

  });

  async function host(): Promise<string> {
    const s = await server;
    const url = await s.url();
    if (url.authority) return url.authority;
    throw new Error("Should never get here");
  }

  handlerContract(async () => {
    if (!runningInNode()) throw new Error("Unsupported");

    const {ClientHandler} = await import('../../../src');
    return new ClientHandler();
  }, runningInNode() ? host(): null as any);

  after(async function () {
    try {
      return (await server).close();
    } catch (ignore) {
    }
  });
});