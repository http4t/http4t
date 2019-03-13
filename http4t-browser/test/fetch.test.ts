import {handlerContract} from '../../http4t-core/test/handler.contract';

describe("FetchHandler", function () {
  handlerContract(async () => {
    if (typeof fetch == 'undefined') throw new Error("Unsupported");

    const {FetchHandler} = await import('../src/fetch');
    return new FetchHandler();
  });
});
