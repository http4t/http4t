import {FetchHandler} from "@http4t/browser/fetch";
import {handlerContract} from "@http4t/core-test/handler.contract";
import {toHttpBin} from "./helpers";

describe("FetchHandler", function () {
    describe('http', () => {
        handlerContract(toHttpBin("http")(new FetchHandler()));
    });
    describe('https', () => {
        handlerContract(toHttpBin("https")(new FetchHandler()));
    });
});
