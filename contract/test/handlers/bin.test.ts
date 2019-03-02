import {handlerContract} from "./handler.contract";
import {BinHandler} from "../../src/index";

describe("HttpBinHandler", function () {
  handlerContract(async () => {
    return new BinHandler();
  });
});
