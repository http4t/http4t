import {expect} from 'chai';
import {
    appendQueries,
    appendQuery,
    queries,
    query,
    removeQueries,
    removeQuery,
    request,
    setQueries,
    setQuery,
    uriString
} from "../src/requests";

describe('query()', () => {
    it("gets a single value", () => {
        expect(query(request("GET", "/?foo=bar"), "foo")).to.eq("bar");
    });
    it("gets the first value where many exist", () => {
        expect(query(request("GET", "/?foo=first&foo=second"), "foo")).to.eq("first");
    });
    it("returns undefined if param does not exist", () => {
        expect(query(request("GET", "/"), "foo")).to.eq(undefined);
    });
})

describe('queries()', () => {
    it("gets a single value", () => {
        expect(queries(request("GET", "/?foo=bar"), "foo")).deep.eq(["bar"]);
    });
    it("gets multiple values", () => {
        expect(queries(request("GET", "/?foo=first&foo=second"), "foo")).deep.eq(["first", "second"]);
    });
    it("gets multiple values including undefined", () => {
        expect(queries(request("GET", "/?foo=first&foo"), "foo")).deep.eq(["first", undefined]);
    });
    it("returns empty array if param does not exist", () => {
        expect(queries(request("GET", "/"), "foo")).to.deep.eq([]);
    });
})

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

describe('removeQuery()', () => {
    it("removes a single query", () => {
        const query = removeQuery(request("GET", "/?shouldBeRemoved=value"), "shouldBeRemoved");
        expect(uriString(query)).to.eq("/");
    });
    it("removes a load of queries at once", () => {
        const query = removeQuery(request("GET", "/?shouldBeRemoved=first&shouldBeRemoved=second"), "shouldBeRemoved");
        expect(uriString(query)).to.eq("/");
    });
    it("removes a load of queries at once and retains others", () => {
        const query = removeQuery(request("GET", "/?shouldBeRemoved=first&shouldBeRemoved=second&shouldNotBeRemoved"), "shouldBeRemoved");
        expect(uriString(query)).to.eq("/?shouldNotBeRemoved");
    });
});

describe('removeQueries()', () => {
    it("removes a single query", () => {
        const query = removeQueries(request("GET", "/?shouldBeRemoved1=value&shouldBeRemoved2=value"),
            "shouldBeRemoved1",
            "shouldBeRemoved2",
            "shouldAlsoBeRemovedButIsntInQuery");
        expect(uriString(query)).to.eq("/");
    });
    it("removes a load of queries at once", () => {
        const query = removeQueries(request("GET", "/?shouldBeRemoved1=first&shouldBeRemoved1=second&shouldBeRemoved2"),
            "shouldBeRemoved1",
            "shouldBeRemoved2");
        expect(uriString(query)).to.eq("/");
    });
    it("removes a load of queries at once and retains others", () => {
        const query = removeQueries(request("GET", "/?shouldBeRemoved1=first&shouldBeRemoved2=second&shouldNotBeRemoved"),
            "shouldBeRemoved1",
            "shouldBeRemoved2");
        expect(uriString(query)).to.eq("/?shouldNotBeRemoved");
    });
});
