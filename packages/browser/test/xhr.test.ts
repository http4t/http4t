import {XmlHttpHandler} from "@http4t/browser/xhr";
import {handlerContract} from '@http4t/core-test/handler.contract';
import {toHttpBin} from "./helpers";

describe("XmlHttpHandler", function () {
    describe('http', () => {
        handlerContract(toHttpBin("http")(new XmlHttpHandler()));
    });
    describe('https', () => {
        handlerContract(toHttpBin("https")(new XmlHttpHandler()));
    });
});
