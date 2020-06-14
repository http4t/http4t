import {appendQueries, appendQuery, request, uriString} from "../src/requests";
import {expect} from 'chai';

describe("appendQuery", () => {

    it("an undefined value", () => {
        const message = appendQuery(request("GET", "/"), "na me", undefined);
        expect(message.uri.query).to.eq("na%20me");
    });

    it("an empty string value", () => {
        const message = appendQuery(request("GET", "/"), "na me", "");
        expect(message.uri.query).to.eq("na%20me=");
    });

    it("starting with an empty query + does encoding", () => {
        const message = appendQuery(request("GET", "/"), "na me", "to/m");
        expect(message.uri.query).to.eq("na%20me=to%2Fm");
    });

    it("existing query", () => {
        const query = appendQuery(request("GET", "/?name=tom"), "name", "tom");
        expect(uriString(query)).to.eq("/?name=tom&name=tom");
    });

    it("appends a load of queries at once", () => {
        const query = appendQueries(request("GET", "/"), {
            "na me": ["tom", "ma tt", undefined, ""],
            "blah": undefined,
            "meh": "",
        });
        expect(uriString(query)).to.eq("/?na%20me=tom&na%20me=ma%20tt&na%20me&na%20me=&blah&meh=");
    });
});