import {appendQuery, request, uriString} from "../src/requests";
import {expect} from 'chai';

describe("appendQuery", () => {

    it("an undefined value", async () => {
        const message = appendQuery(request("GET", "/"), "na me", undefined);
        expect(message.uri.query).to.eq("na%20me");
    });

    it("an empty string value", async () => {
        const message = appendQuery(request("GET", "/"), "na me", "");
        expect(message.uri.query).to.eq("na%20me=");
    });

    it("starting with an empty query + does encoding", async () => {
        const message = appendQuery(request("GET", "/"), "na me", "to/m");
        expect(message.uri.query).to.eq("na%20me=to%2Fm");
    });

    it("existing query", async () => {
        const query = appendQuery(request("GET", "/?name=tom"), "name", "tom");
        expect(uriString(query)).to.eq("/?name=tom&name=tom");
    });
});