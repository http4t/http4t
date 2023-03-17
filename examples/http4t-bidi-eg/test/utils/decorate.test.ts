import {decorate} from "@http4t/bidi-eg-server/utils/decorate";
import chai from 'chai';

const {expect} = chai;

describe("decorate()", function () {
    it('should work with no decoration', async function () {
        const api = {hello: (a: string, b: string) => `hello ${a} ${b}`}

        const decorated = decorate(api, {});

        expect(await decorated.hello("a", "b")).eq("hello a b")
    });
})