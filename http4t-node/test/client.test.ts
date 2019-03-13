import {handlerContract} from "@http4t/core-test/test/handler.contract";

export function runningInNode() {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
}

describe("ClientHandler", function () {
  handlerContract(async () => {
    if (!runningInNode()) throw new Error("Unsupported");

    const {ClientHandler} = await import('../src/client');
    return new ClientHandler();
  });
});
