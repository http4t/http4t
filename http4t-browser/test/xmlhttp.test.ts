import {handlerContract} from '@http4t/core-test/handler.contract';

describe("XmlHttpHandler", function () {
    handlerContract(async () => {
        if (typeof XMLHttpRequest == 'undefined') throw new Error("Unsupported");

        const {XmlHttpHandler} = await import('../src/xmlhttp');
        return new XmlHttpHandler();
    });
});
