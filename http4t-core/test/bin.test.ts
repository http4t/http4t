import {BinHandler} from "@http4t/core/bin";
import {handlerContract} from "./handler.contract";

describe("BinHandler", function () {
    handlerContract(new BinHandler());
});
