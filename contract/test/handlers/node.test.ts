import {assert} from 'chai';
import {BinHandler} from "../../src/handlers";

import {Server} from "../../src/server";
import {handlerContract} from "./handler.contract";


export function runningInNode() {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
}

describe("ClientHandler", function () {
  handlerContract(async () => {
    if (!runningInNode()) throw new Error("Unsupported");

    const {ClientHandler} = await import('../../src/handlers/node/client');
    return new ClientHandler();
  });
});

describe("ServerHandler", function () {
  let server = new Promise<Server>(async (resolve, reject) => {
    try {
      const {ServerHandler} = await import('../../src/handlers/node/server');
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

    const {ClientHandler} = await import('../../src/handlers/node/client');
    return new ClientHandler();
  }, host());

  after(async function () {
    try {
      return (await server).close();
    } catch (ignore) {
    }
  });
});
