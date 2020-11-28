import {BinHandler} from "@http4t/core/bin";
import {describe} from "mocha";
import {handlerContract} from "./handler.contract";

describe("BinHandler", function () {
    handlerContract(new BinHandler());
});
