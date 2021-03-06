import {toHttpBin} from "@http4t/browser-test/helpers";
import {handlerContract} from "@http4t/core-test/handler.contract";
import {ClientHandler} from "@http4t/node/client";

describe("ClientHandler", function () {
    describe('http', () => {
        handlerContract(toHttpBin("http")(ClientHandler.defaultTo('https')/* test that protocol in request overrides default*/));
    });
    describe('https', () => {
        handlerContract(toHttpBin("https")(ClientHandler.defaultTo('http')/* test that protocol in request overrides default*/));
    });
});
