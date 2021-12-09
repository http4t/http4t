import {requestOf} from "@http4t/core/requests";
import {failure} from "@http4t/result";
import {problem} from "@http4t/result/JsonPathResult";
import {expect} from 'chai';
import {RoutingError, WRONG_ROUTE} from "@http4t/bidi/lenses";
import {fail} from "@http4t/bidi/lenses/AlwaysFailLens";

describe("AlwaysFailLens", () => {
    const error: RoutingError = {type: WRONG_ROUTE, problems: [problem("deliberate error", [])]};

    it("always fails", async () => {
        expect(await fail(error).get(requestOf("GET", "/"))).to.deep.eq(failure(error))
    });

    it("sets nothing", async () => {
        const req = requestOf("GET", "/");
        expect(await fail(error).set(req, {} as never)).to.deep.eq(req)
    });

});
