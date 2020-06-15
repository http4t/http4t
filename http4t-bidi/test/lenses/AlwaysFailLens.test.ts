import {request} from "@http4t/core/requests";
import {Result} from "@http4t/result";
import {expect} from 'chai';
import {WrongRoute} from "../../src/lenses";
import {fail} from "../../src/lenses/AlwaysFailLens";

describe("AlwaysFailLens", () => {
    const error: Result<WrongRoute, never> = {error: {type: 'wrong-route', message: "wrong route"}};

    it("always fails", async () => {

        expect(await fail(error).get(request("GET", "/"))).to.deep.eq(error)
    });

    it("sets nothing", async () => {
        const req = request("GET", "/");
        expect(await fail(error).set(req, {} as never)).to.deep.eq(req)
    });

});