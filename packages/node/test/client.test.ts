import {toHttpBin, toHttpBinDocker} from "@http4t/browser-test/helpers";
import {handlerContract, handlerHttpsSmokeTest} from "@http4t/core-test/handler.contract";
import {ClientHandler} from "@http4t/node/client";

describe("ClientHandler", function () {
    describe('http', function () {
        this.timeout(10000);
        handlerContract(toHttpBinDocker("http")(ClientHandler.defaultTo('https')))
    });
    describe('https', function () {
        handlerHttpsSmokeTest(toHttpBin("https")(ClientHandler.defaultTo('https')));
    });
});
