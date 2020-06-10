import {expect} from 'chai';
import {EmptyLens} from "../../src/lenses/EmptyLens";
import {request} from "@http4t/core/requests";
import {success} from "@http4t/result";

describe("EmptyLens", () => {

    it("wraps undefined", async () => {
        expect(await new EmptyLens().get(request("GET", "/"))).to.deep.eq(success(undefined))
    });

    it("sets nothing", async () => {
        const req = request("GET", "/");
        expect(await new EmptyLens().set(req, undefined)).to.deep.eq(req)
    });

});