import chai from "chai";
import {json} from "@http4t/bidi/lenses/JsonLens";
import {HttpMessage} from "@http4t/core/contract";
import {ok, responseOf} from "@http4t/core/responses";
import {UnionLens} from "@http4t/bidi/lenses/UnionLens";
import {toJSON} from "@http4t/core/messages";
import {response} from "@http4t/bidi/responses";
import {expectFailure, expectSuccess} from "@http4t/result";
import {RoutingResult} from "@http4t/bidi/lenses";
import {problem} from "@http4t/result/JsonPathResult";

const {expect} = chai;

describe("Union lens", () => {

    type OkResponse = {
        ok: true
    }
    type NotFoundResponse = {
        ok: false
    }
    const union = new UnionLens(
        response(200, json<OkResponse>()),
        response(404, json<NotFoundResponse>()),
        (value: OkResponse | NotFoundResponse): value is OkResponse => value.ok
    )

    it("get() picks first lens if it matches", async () => {
        const result: RoutingResult<OkResponse | NotFoundResponse> = await union.get(await union.set(ok(), {ok: true}))

        expect(expectSuccess(result)).to.deep.eq({ok: true})
    });
    it("get() picks second len if first does not match", async () => {
        const result: RoutingResult<OkResponse | NotFoundResponse> = await union.get(await union.set(ok(), {ok: false}))

        expect(expectSuccess(result)).to.deep.eq({ok: false})
    });

    it("get() fails if neither lens matches and returns problems from both lenses", async () => {
        /* TODO: all the problems is better than just the problems from the first or second lens, but it would be
        *   better if they were grouped by lens somehow */
        const result: RoutingResult<OkResponse | NotFoundResponse> = await union.get(ok("{notJson"))

        expect(expectFailure(result)).to.deep.eq({
            "problems": [
                problem("Expected valid json- \"Unexpected token n in JSON at position 1\"", ["body"]),
                problem("Status was not 404", ["status"])
            ],
            "response": {
                "body": "Status was not 404",
                "headers": [],
                "status": 400
            },
            "type": "route-failed"
        })
    });

    it("set() picks first lens if it matches test", async () => {
        const result: HttpMessage = await union.set(ok(), {ok: true})

        expect(await toJSON(result)).to.deep.eq(responseOf(200, JSON.stringify({ok: true}), ["Content-Type", "application/json"]))
    });

    it("set() picks second len if first does not match test", async () => {
        const result: HttpMessage = await union.set(ok(), {ok: false})

        expect(await toJSON(result)).to.deep.eq(responseOf(404, JSON.stringify({ok: false}), ["Content-Type", "application/json"]))
    });

})

