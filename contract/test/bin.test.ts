import {handlerContract} from "./handler.contract";
import {BinHandler} from "../src";

describe("HttpBinHandler", function () {
  handlerContract(async () => {
    return new BinHandler();
  });
});
