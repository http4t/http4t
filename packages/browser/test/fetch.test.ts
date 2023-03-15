import {FetchHandler} from "@http4t/browser/fetch";
import {handlerContract} from "@http4t/core-test/handler.contract";
import {toHttpBin} from "./helpers";

describe("FetchHandler", function () {
    describe('http', function () {
        this.timeout(10000);
        handlerContract(toHttpBin("http")(new FetchHandler()));
    });
    describe('https', function () {
        this.timeout(10000);
        handlerContract(toHttpBin("https")(new FetchHandler()));
    });
});
