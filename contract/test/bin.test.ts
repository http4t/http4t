import {handlerContract} from "./handler.contract";
import {BinHandler} from "../src/handlers/bin";

describe("HttpBinHandler", function () {
  handlerContract(async () => {
    return new BinHandler();
  });
});
