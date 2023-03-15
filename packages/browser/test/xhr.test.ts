import {XmlHttpHandler} from "@http4t/browser/xhr";
import {handlerContract} from '@http4t/core-test/handler.contract';
import {toHttpBin} from "./helpers";

describe("XmlHttpHandler", function () {
    describe('http', function () {
        this.timeout(10000);
        handlerContract(toHttpBin("http")(new XmlHttpHandler()));
    });
    describe('https', function ()  {
        this.timeout(10000);
        handlerContract(toHttpBin("https")(new XmlHttpHandler()));
    });
});
