import chai from "chai";
import {bodyJson, JsonBody, jsonBody, parseJson} from "@http4t/core/json";
import {post} from "@http4t/core/requests";

const {expect} = chai;

function nextResult<T>(it: AsyncIterable<T>): Promise<IteratorResult<T>> {
    return it[Symbol.asyncIterator]().next();
}

function next<T>(it: AsyncIterable<T>): Promise<T> {
    return nextResult(it).then(r => r.value);
}

describe('JsonBody', async () => {
    it('lazily serializes', async () => {
        let callCount = 0;
        const data = {
            toJSON: () => {
                return ++callCount;
            }
        };

        const body = jsonBody(data);
        expect(callCount).eq(0);

        expect(await next(body)).eq("1");
        expect(callCount).eq(1);
    });

    it('does not serialise or deserialise when called with bodyJson', async () => {
        let callCount = 0;
        const data = {
            toJSON: () => {
                return ++callCount;
            }
        };

        const body = jsonBody(data);
        const bodyData = await bodyJson(body);

        expect(bodyData).eq(data);
        expect(callCount).eq(0);
    });

    it('allows parsing HttpMessage just once, by converting into JsonBody', async () => {
        const parsed = await parseJson(post("", JSON.stringify({some: "data"})));
        const body = parsed.body;

        expect(body).instanceof(JsonBody);
        expect(await bodyJson(parsed)).deep.eq({some: "data"});
        expect(await parseJson(parsed)).eq(parsed);
    });

    it('handles undefined', async () => {
        const body = jsonBody(undefined);
        expect(await bodyJson(body)).eq(undefined);
    });
});
