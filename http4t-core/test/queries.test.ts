import {appendQueries, appendQuery, request, setQueries, setQuery, uriString} from "../src/requests";
import {expect} from 'chai';

describe("appendQuery()", () => {

    it("empty string value represented by =", () => {
        const message = appendQuery(request("GET", "/"), "na me", "");
        expect(message.uri.query).to.eq("na+me=");
    });

    it("undefined value represented by absence of =", () => {
        const message = appendQuery(request("GET", "/"), "na me", undefined);
        expect(message.uri.query).to.eq("na+me");
    });

    it("uri-encodes values", () => {
        const message = appendQuery(request("GET", "/"), "na me", "to/m");
        expect(message.uri.query).to.eq("na+me=to%2Fm");
    });

    it("appends to an existing query", () => {
        const query = appendQuery(request("GET", "/?name=tom"), "name", "matt");
        expect(uriString(query)).to.eq("/?name=tom&name=matt");
    });
});

describe('appendQueries()', () => {
    it("appends a load of queries at once", () => {
        const query = appendQueries(request("GET", "/?existing=value"), {
            "na me": ["tom", "ma tt", undefined, ""],
            "existing": undefined,
            "meh": "",
        });
        expect(uriString(query)).to.eq("/?existing=value&na+me=tom&na+me=ma+tt&na+me&na+me=&existing&meh=");
    });
});

describe("setQuery()", () => {

    it("empty string value represented by =", () => {
        const message = setQuery(request("GET", "/na+me=old_value&na+me=old_value"), "na me", "");
        expect(message.uri.query).to.eq("na+me=");
    });

    it("undefined value represented by absence of =", () => {
        const message = setQuery(request("GET", "/na+me=old_value&na+me=old_value"), "na me", undefined);
        expect(message.uri.query).to.eq("na+me");
    });

    it("uri-encodes values", () => {
        const message = appendQuery(request("GET", "/na+me=old_value&na+me=old_value"), "na me", "to/m");
        expect(message.uri.query).to.eq("na+me=to%2Fm");
    });
});

describe('setQueries()', () => {
    it("appends a load of queries at once", () => {
        const query = setQueries(request("GET", "/?existing=old_value"), {
            "na me": ["tom", "ma tt", undefined, ""],
            "existing": "new_value",
            "meh": "",
        });
        expect(uriString(query)).to.eq("/?na+me=tom&na+me=ma+tt&na+me&na+me=&existing=new_value&meh=");
    });
});