import {bufferText} from "@http4t/core/bodies";
import {get} from "@http4t/core/requests";
import {responseOf as responseOf} from "@http4t/core/responses";
import {expect} from 'chai';
import {routeFailedError, wrongRouteError} from "../src/lenses";
import {fail} from "../src/lenses/AlwaysFailLens";
import {empty} from "../src/lenses/EmptyLens";
import {json} from "../src/lenses/JsonLens";
import {$request} from "../src/requests";
import {buildRouter} from "../src/router";
import {route} from "../src/routes";

describe('Server', () => {
    it('matches route and calls handler', async () => {
        const routes = {
            example: route(
                $request('GET', "/some/path"),
                json<string>()
            )
        };

        async function example(): Promise<string> {
            return "hello world"
        }

        const s = buildRouter(routes, {example});

        const response = await s.handle(get('/'));

        expect(response.status).eq(404);
    });

    it('ignores trailing slashes in url', async () => {
        const routes = {
            example: route(
                $request('GET', "/some/path"),
                json<string>()
            )
        };

        async function example(): Promise<string> {
            return "hello world"
        }

        const s = buildRouter(routes, {example});

        const response = await s.handle(get('/some/path/'));

        expect(response.status).eq(200);
    });

    it('404 on match failure', async () => {
        const routes = {
            example: route(
                $request('GET', "/some/path"),
                json<string>()
            )
        };

        async function example(): Promise<string> {
            return "hello world"
        }

        const s = buildRouter(routes, {example});

        const response = await s.handle(get('/'));

        expect(response.status).eq(404);
    });

    it('short circuits if route fails with routeFailed("reason")', async () => {
        const routes = {
            fails: route(
                fail(routeFailedError("expected failure", [], responseOf(400))),
                empty()
            ),
            doesNotGetHit: route(empty(), empty())
        };

        let wasHit = false;
        const behaviourDoesNotGetHit = {
            doesNotGetHit: () => {
                wasHit = true;
            }
        } as any;
        const s = buildRouter(routes, behaviourDoesNotGetHit);

        const response = await s.handle(get('/'));

        expect(response.status).eq(400);
        expect(wasHit).eq(false);
    });

    it('does not short circuit if a route fails with wrongRoute("reason")', async () => {
        const routes = {
            fails: route(
                fail(wrongRouteError("expected failure", [])),
                empty()
            ),
            getsHit: route(empty(), json<string>())
        };

        const onlyGetsHitIsUsed = {
            getsHit: () => "ok"
        } as any;
        const s = buildRouter(routes, onlyGetsHitIsUsed);

        const response = await s.handle(get('/'));

        expect(response.status).eq(200);
        expect(await bufferText(response.body)).eq("\"ok\"");
    });
});

