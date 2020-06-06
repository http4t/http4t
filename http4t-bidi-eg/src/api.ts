import {response} from "@http4t/bidi/lenses/ExpectStatusLens";
import {json} from "@http4t/bidi/lenses/JsonLens";
import {maybe} from "@http4t/bidi/lenses/NotFoundLens";
import {nothing} from "@http4t/bidi/lenses/NothingLens";
import {path} from "@http4t/bidi/paths";
import {v} from "@http4t/bidi/paths/variables";
import {request} from "@http4t/bidi/requests";
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
    request('GET', '/probe/ready'),
    response(200, nothing())
  ),
  live: route(
    request('GET', '/probe/live'),
    response(200, nothing())
  ),
  post: route(
    request('POST', '/store', json()),
    response(201, json<{ id: string }, HttpResponse>())
  ),
  get: route(
    request('GET', path({id: v.segment}, p => ["store", p.id]), json()),
    maybe(json<Doc, HttpResponse>())
  ),
  test: route(
    request("POST", '/test/store-then-throw', json()),
    response(200, nothing())
  )
}
