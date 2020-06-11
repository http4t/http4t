import {expect} from 'chai';
import {header, setHeader} from "../src/headers";
import {appendHeader, removeHeaders, updateHeaders} from "../src/messages";
import {request} from "../src/requests";

describe("header()", () => {
    it("formats HeaderValueLike values for you", () => {
        expect(header("date", new Date(1591883765333))).deep.eq(["date", "Thu, 11 Jun 2020 13:56:05 GMT"])
        expect(header("number", 123)).deep.eq(["number", "123"])
    });
});

describe('setHeader()', () => {
    it('works with empty array', async () => {
        expect(setHeader([], header('header-name', 'value')))
            .deep.eq([['header-name', 'value']])
    });

    it('deletes old header value', async () => {
        expect(setHeader([
            header('unchanged', 'first'),
            header('header-name', 'old value'),
            header('unchanged', 'second')], header('header-name', 'new value')))
            .deep.eq([['unchanged', 'first'], ['unchanged', 'second'], ['header-name', 'new value']])
    });

    it('is case insensitive', async () => {
        expect(setHeader([header('header-name', 'old value')], header('Header-Name', 'value')))
            .deep.eq([['Header-Name', 'value']])
    });
});

describe('appendHeader()', () => {
    it('adds on another header', () => {
        const message = request("GET", "/");
        expect(appendHeader(message, "X-Matt", "Savage").headers).deep.eq([["X-Matt", "Savage"]])
    });

    it('adds on another header', () => {
        const message = request("GET", "/");
        const appendedOnce = appendHeader(message, "X-Matt", "Savage");
        expect(appendHeader(appendedOnce, "X-Matt", "S").headers).deep.eq([["X-Matt", "Savage"], ["X-Matt", "S"]])
    });
});

describe("removeHeaders()", () => {
    it("removes all headers case-insensitively", () => {
        const message = request("GET", "/", undefined, ["X-Matt", "S"], ["X-matt", "S"], ["X-Tom", "S"]);
        expect(removeHeaders(message, "X-Matt").headers).deep.eq([["X-Tom", "S"]])
    });
});

describe("updateHeaders()", () => {
    it("updates header values", () => {
        const req = request("GET", "/", undefined, ["name", "value"], ["name", "value"], ["name2", "value2"])
        expect(updateHeaders(req, "name", (n: string) => n + "updated").headers).deep.eq([["name", "valueupdated"], ["name", "valueupdated"], ["name2", "value2"]])
    });
});