import chai from "chai";
import {EmptyLens} from "@http4t/bidi/lenses/EmptyLens";
import {requestOf} from "@http4t/core/requests";
import {success} from "@http4t/result";

const {expect} = chai;

describe("EmptyLens", () => {

    it("wraps undefined", async () => {
        expect(await new EmptyLens().get(requestOf("GET", "/"))).to.deep.eq(success(undefined))
    });

    it("sets nothing", async () => {
        const req = requestOf("GET", "/");
        expect(await new EmptyLens().set(req, undefined)).to.deep.eq(req)
    });

});
