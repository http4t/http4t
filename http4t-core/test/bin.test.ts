import {describe} from "mocha";
import {handlerContract} from "./handler.contract";
import {BinHandler} from "@http4t/core/bin";

describe("HttpBinHandler", function () {
    handlerContract(async () => {
        return new BinHandler();
    });
});
