import {expect} from 'chai';
import {request} from "@http4t/core/requests";
import {Result} from "@http4t/result";
import {AlwaysFailLens} from "../../src/lenses/AlwaysFailLens";
import {WrongRoute} from "../../src/lenses";

describe("AlwaysFailLens", () => {
    const error: Result<WrongRoute, never> = { error: {type: 'wrong-route', message: "wrong route"} };

    it("always fails", async () => {

        expect(await new AlwaysFailLens(error).get(request("GET", "/"))).to.deep.eq(error)
    });

    it("sets nothing", async () => {
        const req = request("GET", "/");
        expect(await new AlwaysFailLens(error).set(req, {} as never)).to.deep.eq(req)
    });

});