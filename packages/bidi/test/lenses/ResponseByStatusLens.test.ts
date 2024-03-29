import {json, statuses} from "@http4t/bidi/responses";
import {ok, toJSON} from "@http4t/core/responses";
import chai from "chai";
import {AuthError} from "@http4t/bidi/auth/authError";
import {assertExhaustive} from "@http4t/core/util/assertExhaustive";

const {expect} = chai;

describe('ResponseByStatusLens', function () {
    const lens = statuses(
        {
            401: json<AuthError>(),
            403: json<AuthError>()
        },
        (value: AuthError) => {
            const reason = value.reason;
            switch (reason) {
                case "unauthorized":
                    return 401;
                case "forbidden":
                    return 403;
                default:
                    return assertExhaustive(reason);
            }
        });

    it('set() should return correct status', async function () {
        const unauthorised = await lens.set(ok(), {reason: "unauthorized", message: "expected"});

        expect(await toJSON(unauthorised)).deep.contains({
            status: 401,
            body: JSON.stringify({reason: "unauthorized", message: "expected"})
        })

        const forbidden = await lens.set(ok(), {reason: "forbidden", message: "expected"});

        expect(await toJSON(forbidden)).deep.contains({
            status: 403,
            body: JSON.stringify({reason: "forbidden", message: "expected"})
        })
    });
});