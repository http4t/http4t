import {expect} from 'chai';
import {json} from "@http4t/bidi/lenses/JsonLens";
import {StatusLens} from "@http4t/bidi/lenses/StatusLens";
import {HttpMessage, HttpResponse} from "@http4t/core/contract";
import {ok, responseOf} from "@http4t/core/responses";
import {UnionLens} from "@http4t/bidi/lenses/UnionLens";
import {toJSON} from "@http4t/core/messages";

describe("Union lens", () => {

    it("union", async () => {
        type OkResponse = {
            ok: true
        }
        type NotFoundResponse = {
            ok: false
        }
        const union = new UnionLens(
            new StatusLens(200, json<OkResponse, HttpResponse>()),
            new StatusLens(404, json<NotFoundResponse, HttpResponse>()),
            (value: OkResponse | NotFoundResponse): value is OkResponse => value.ok
        )

        const result: HttpMessage = await union.set(ok(), {ok: false})

        expect(await toJSON(result)).to.deep.eq(responseOf(404, JSON.stringify({ok: false}), ["Content-Type", "application/json"]))
    });

})

