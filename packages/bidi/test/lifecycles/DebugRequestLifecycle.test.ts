import {get, post} from "@http4t/core/requests";
import {buildRouter} from "@http4t/bidi/router";
import {route} from "@http4t/bidi/routes";
import {request} from "@http4t/bidi/requests";
import {response} from "@http4t/bidi/responses";
import {text} from "@http4t/bidi/lenses/TextLens";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {json} from "@http4t/bidi/lenses/JsonLens";
import chai from 'chai';
import {getHeaderValue} from "@http4t/core/messages";
import {Http4tHeaders, Http4tRouteResult} from "@http4t/bidi/lifecycles/headers";

const {expect} = chai;


describe("DebugRequestLifecycle", async function () {
    const routes = {
        test: route(
            request("GET", "test"),
            response(200, text())),

        json: route(
            request("POST", "json", json()),
            response(200, json())),
        serverError: route(
            request("GET", "server-error"),
            response(200, text()))
    };

    const router = buildRouter(routes, {
        test: async () => "body",
        json: async (req) => req,
        serverError: async () => {
            throw new Error("Expected exception")
        }
    }, new DebugRequestLifecycle({now: () => new Date(Date.parse("2023-03-21T21:13"))}));

    it("Adds debug headers on match", async function () {
        const response = await router.handle(get("test"));

        expect(getHeaderValue(response, Http4tHeaders.ROUTE_RESULT)).eq(Http4tRouteResult.SUCCESS);
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_MATCHED_ROUTE)).eq("test");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_START_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_END_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
    });

    it("Adds debug headers on no match", async function () {
        const response = await router.handle(get("nonexistent"));

        expect(getHeaderValue(response, Http4tHeaders.ROUTE_RESULT)).eq(Http4tRouteResult.NO_MATCH);
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_MATCHED_ROUTE)).eq(undefined);
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_START_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_END_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
    });
    it("Adds debug headers on unparseable request", async function () {
        const response = await router.handle(post("json", "{notjson"));

        expect(getHeaderValue(response, Http4tHeaders.ROUTE_RESULT)).eq(Http4tRouteResult.CLIENT_ERROR);
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_MATCHED_ROUTE)).eq("json");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_START_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_END_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
    });
    it("Adds debug headers on server error", async function () {
        const response = await router.handle(get("server-error"));

        expect(getHeaderValue(response, Http4tHeaders.ROUTE_RESULT)).eq(Http4tRouteResult.SERVER_ERROR);
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_MATCHED_ROUTE)).eq("serverError");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_START_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
        expect(getHeaderValue(response, Http4tHeaders.DEBUG_END_TIME)).eq("Tue, 21 Mar 2023 21:13:00 GMT");
    });
});
