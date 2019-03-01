import {handlerContract} from "./handler.contract";
import {BinHandler} from "../src/handlers";

describe("HttpBinHandler", function () {
  handlerContract(async () => {
    return new BinHandler();
  });
});
