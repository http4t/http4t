import {toHttpBin, toHttpBinDocker} from "@http4t/browser-test/helpers";
import {handlerContract} from "@http4t/core-test/handler.contract";
import {ClientHandler} from "@http4t/node/client";

describe("ClientHandler", function () {
    describe('http', function () {
        this.timeout(10000);
        handlerContract(toHttpBinDocker("http")(ClientHandler.defaultTo('http')))
    });
    describe('https', function () {
        this.timeout(10000);
        handlerContract(toHttpBin("https")(ClientHandler.defaultTo('http')/* test that protocol in request overrides default*/));
    });
});
