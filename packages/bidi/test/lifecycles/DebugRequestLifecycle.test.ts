import {get, post} from "@http4t/core/requests";
import {buildRouter} from "@http4t/bidi/router";
import {route} from "@http4t/bidi/routes";
import {request} from "@http4t/bidi/requests";
import {response} from "@http4t/bidi/responses";
import {text} from "@http4t/bidi/lenses/TextLens";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";
import {json} from "@http4t/bidi/lenses/JsonLens";

describe("DebugRequestLifecycle", () => {
    it("always fails", async () => {
        const routes = {test: route(request("GET", "test"), response(200, text())),
            json: route(request("POST", "json", json()), response(200, json()))};
        const router = await buildRouter(routes, {test: async () => "body"}, new DebugRequestLifecycle());
        await router.handle(get("test"))
        await router.handle(get("nonexistent"))
        await router.handle(post("json","{notjson"))
    });
});
