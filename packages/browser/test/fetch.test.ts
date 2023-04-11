import {fetchAdapter, FetchHandler} from "@http4t/browser/fetch";
import {handlerContract} from "@http4t/core-test/handler.contract";
import {toHttpBin, toHttpBinDocker} from "./helpers";
import {BinHandler} from "@http4t/core/bin";

describe("fetch", function () {
    describe('FetchHandler', function () {
        describe('http', function () {
            this.timeout(10000);
            handlerContract(toHttpBinDocker("http")(new FetchHandler()));
        });
        describe('https', function () {
            this.timeout(10000);
            handlerContract(toHttpBin("https")(new FetchHandler()));
        });
    });
    describe('fetchAdapter()', function () {
        handlerContract(toHttpBin("http")(new FetchHandler({fetch: fetchAdapter(new BinHandler())})));
    });
});
