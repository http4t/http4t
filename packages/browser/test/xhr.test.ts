import {XmlHttpHandler} from "@http4t/browser/xhr";
import {handlerContract, handlerHttpsSmokeTest} from '@http4t/core-test/handler.contract';
import {toHttpBin, toHttpBinDocker} from "./helpers";

describe("XmlHttpHandler", function () {
    describe('http', function () {
        this.timeout(10000);
        handlerContract(toHttpBinDocker("http")(new XmlHttpHandler()));
    });
    describe('https', function ()  {
        this.timeout(10000);
        handlerHttpsSmokeTest((toHttpBin("https")(new XmlHttpHandler())));
    });
});
