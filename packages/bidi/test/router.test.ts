import {bufferText} from "@http4t/core/bodies";
import {get, toJSON} from "@http4t/core/requests";
import {responseOf as responseOf} from "@http4t/core/responses";
import {expect} from 'chai';
import {routeFailedError, wrongRouteError} from "@http4t/bidi/lenses";
import {fail} from "@http4t/bidi/lenses/AlwaysFailLens";
import {empty} from "@http4t/bidi/lenses/EmptyLens";
import {intersect, request, text} from "@http4t/bidi/requests";
import {buildRouter} from "@http4t/bidi/router";
import {route, Routes} from "@http4t/bidi/routes";
import {DebugRequestLifecycle} from "@http4t/bidi/lifecycles/DebugRequestLifecycle";

describe('Router', () => {
    interface Api {
        helloWorld(): Promise<string>

        routeFailed(): Promise<undefined>

        wrongRoute(): Promise<undefined>

        zzzLastRouteAlsoMatchesWrongRoute(): Promise<string>
    }

    const routes: Routes<Api> = {
        helloWorld: route(
            request('GET', "/some/path"),
            text()
        ),
        routeFailed: route(
            intersect(
                request("GET", "/routeFailed"),
                fail(routeFailedError("expected failure", [], responseOf(400, "routeFailed")))
            ),
            empty()
        ),
        wrongRoute: route(
            intersect(
                request("GET", "/wrongRoute"),
                fail(wrongRouteError("expected failure", []))
            ),
            empty()
        ),
        zzzLastRouteAlsoMatchesWrongRoute: route(
            request("GET", "/wrongRoute"),
            text()
        )
    };
    let lastRouteWasHit = false;
    const router = buildRouter(
        routes,
        {
            async helloWorld(): Promise<string> {
                return "hello world";
            },
            async routeFailed(): Promise<undefined> {
                return undefined;
            },
            async wrongRoute(): Promise<undefined> {
                return undefined;
            },
            async zzzLastRouteAlsoMatchesWrongRoute(): Promise<string> {
                lastRouteWasHit = true;
                return "last route";
            }
        },
        new DebugRequestLifecycle());

    it('matches route and calls handler', async () => {
        const response = await router.handle(get("/some/path"));

        expect(await toJSON(response)).deep.eq(
            {
                status: 200,
                "headers": [
                    [
                        "Content-Type",
                        "text/plain"
                    ]
                ],
                body: "hello world"
            });
    });

    it('returns 404 when no route found', async () => {
        const response = await router.handle(get('/doesnotexist'));

        expect(response.status).eq(404);
    });

    it('ignores trailing slashes in url', async () => {
        const response = await router.handle(get('/some/path/'));

        expect(response.status).eq(200);
    });

    it('short circuits if route fails with routeFailed("reason")', async () => {
        const response = await router.handle(get('/routeFailed'));

        expect(response.status).eq(400);
        expect(lastRouteWasHit).eq(false);
    });

    it('does not short circuit if a route fails with wrongRoute("reason")', async () => {
        const response = await router.handle(get('/wrongRoute'));

        expect(response.status).eq(200);
        expect(await bufferText(response.body)).eq("last route");
    });
});

