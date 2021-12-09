import {expect} from 'chai';
import {header} from "@http4t/core/headers";
import {appendHeader, removeHeaders, selectHeaders, setHeader, updateHeaders} from "@http4t/core/messages";
import {requestOf} from "@http4t/core/requests";

describe("header()", () => {
    it("formats HeaderValueLike values for you", () => {
        expect(header("date", new Date(1591883765333))).deep.eq(["date", "Thu, 11 Jun 2020 13:56:05 GMT"])
        expect(header("number", 123)).deep.eq(["number", "123"])
    });
});

describe('setHeader()', () => {
    it('works with empty array', async () => {
        expect(setHeader(requestOf("GET", "/"), 'header-name', 'value').headers)
            .deep.eq([['header-name', 'value']])
    });

    it('deletes old header value', async () => {
        expect(setHeader(requestOf("GET", "/", "",
            header('unchanged', 'first'),
            header('header-name', 'old value'),
            header('unchanged', 'second')), 'header-name', 'new value').headers)
            .deep.eq([['unchanged', 'first'], ['unchanged', 'second'], ['header-name', 'new value']])
    });

    it('is case insensitive', async () => {
        expect(setHeader(requestOf("GET", "/", "", header('header-name', 'old value')), 'Header-Name', 'value').headers)
            .deep.eq([['Header-Name', 'value']])
    });
});

describe('appendHeader()', () => {
    it('adds on another header', () => {
        const message = requestOf("GET", "/");
        expect(appendHeader(message, "X-Matt", "Savage").headers).deep.eq([["X-Matt", "Savage"]])
    });

    it('adds on another header', () => {
        const message = requestOf("GET", "/");
        const appendedOnce = appendHeader(message, "X-Matt", "Savage");
        expect(appendHeader(appendedOnce, "X-Matt", "S").headers).deep.eq([["X-Matt", "Savage"], ["X-Matt", "S"]])
    });
});

describe("removeHeaders()", () => {
    it("removes all headers case-insensitively", () => {
        const message = requestOf("GET", "/", undefined, ["X-Removed-1", "S"], ["X-removed-1", "S"], ["X-removed-2", "S"], ["X-Tom", "S"]);
        expect(removeHeaders(message, "X-REmoved-1", "X-REmoved-2").headers).deep.eq([["X-Tom", "S"]])
    });
});
describe("selectHeaders()", () => {
    it("selects all headers case-insensitively", () => {
        const message = requestOf("GET", "/", undefined, ["X-Selected-1", "S"], ["X-selected-1", "S"], ["X-selected-2", "S"], ["X-Tom", "S"]);
        expect(selectHeaders(message, "X-SElected-1", "X-SElected-2").headers).deep.eq([["X-Selected-1", "S"], ["X-selected-1", "S"], ["X-selected-2", "S"]])
    });
});

describe("updateHeaders()", () => {
    it("updates header values", () => {
        const req = requestOf("GET", "/", undefined, ["name", "value"], ["name", "value"], ["name2", "value2"])
        expect(updateHeaders(req, "name", (n: string) => n + "updated").headers).deep.eq([["name", "valueupdated"], ["name", "valueupdated"], ["name2", "value2"]])
    });
});
