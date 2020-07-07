import {requestOf} from "@http4t/core/requests";
import {failure} from "@http4t/result";
import {problem} from "@http4t/result/JsonPathResult";
import {expect} from 'chai';
import {RoutingError} from "../../src/lenses";
import {fail} from "../../src/lenses/AlwaysFailLens";

describe("AlwaysFailLens", () => {
    const error: RoutingError = {type: "wrong-route", problems: [problem("deliberate error", [])]};

    it("always fails", async () => {
        expect(await fail(error).get(requestOf("GET", "/"))).to.deep.eq(failure(error))
    });

    it("sets nothing", async () => {
        const req = requestOf("GET", "/");
        expect(await fail(error).set(req, {} as never)).to.deep.eq(req)
    });

});