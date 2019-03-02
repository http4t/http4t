import {handlerContract} from '../handler.contract';

describe("FetchHandler", function () {
  handlerContract(async () => {
    if (typeof fetch == 'undefined') throw new Error("Unsupported");

    const {FetchHandler} = await import('../../../src');
    return new FetchHandler();
  });
});
