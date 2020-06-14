import {empty} from "@http4t/bidi/lenses/EmptyLens";
import {json} from "@http4t/bidi/lenses/JsonLens";
import {maybe} from "@http4t/bidi/lenses/NotFoundLens";
import {response} from "@http4t/bidi/lenses/StatusLens";
import {path} from "@http4t/bidi/paths";
import {v} from "@http4t/bidi/paths/variables";
import {$request} from "@http4t/bidi/requests";
import {route, Routes} from "@http4t/bidi/routes";
import {HttpResponse} from "@http4t/core/contract";
import {Doc} from "./Store";

export type Api = {
    ready: () => Promise<void>;
    live: () => Promise<void>;
    post: (request: Doc) => Promise<{ id: string }>;
    get: (request: { id: string }) => Promise<Doc | undefined>;
    test: (request: Doc) => Promise<void>;
}

export const routes: Routes<Api> = {
    ready: route(
        $request('GET', '/probe/ready'),
        response(200, empty())
    ),
    live: route(
        $request('GET', '/probe/live'),
        response(200, empty())
    ),
    post: route(
        $request('POST', '/store', json<Doc>()),
        response(201, json<{ id: string }, HttpResponse>())
    ),
    get: route(
        $request('GET', path({id: v.segment}, p => ["store", p.id]), json()),
        maybe(json<Doc, HttpResponse>())
    ),
    test: route(
        $request("POST", '/test/store-then-throw', json<Doc>()),
        response(200, empty())
    )
}
