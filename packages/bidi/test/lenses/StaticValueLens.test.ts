import {header, value} from "@http4t/bidi/messages";
import {header as headerOf} from "@http4t/core/headers";
import {ok, responseOf} from "@http4t/core/responses";
import {expect} from "chai";
import {expectFailure, expectSuccess} from "@http4t/result";
import {routeFailed} from "@http4t/bidi/lenses";

describe('StaticValueLens', function () {
    const headerLens = header('Access-Control-Allow-Origin');
    const lens = value("*", headerLens);

    it('uses provided lens to get value and returns undefined if value is as expected', async function () {
        const response = ok(undefined, headerOf('Access-Control-Allow-Origin', '*'));
        const result = expectSuccess(await lens.get(response));
        expect(result).eq(undefined)
    });

    it('uses provided lens to get value and fails if value is not as expected', async function () {
        const response = ok(undefined, headerOf('Access-Control-Allow-Origin', 'wrong value'));
        const result = await lens.get(response);
        expect(result).deep.eq(routeFailed("Expected: *, but got: wrong value", [], responseOf(400)))
    });

    it('uses provided lens to get value and returns fails if value is as expected', async function () {
        const response = ok(undefined, headerOf('Some-Other-Header', '*'));
        const actual = expectFailure(await lens.get(response));
        const expected = expectFailure(await headerLens.get(response));

        expect(actual).deep.eq(expected)
    });
});