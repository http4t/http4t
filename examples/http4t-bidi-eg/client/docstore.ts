import {jwtRoutes, JwtString} from "@http4t/bidi-jwt";
import {Result} from "@http4t/result";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {empty, json, path, request} from "@http4t/bidi/requests";
import {AuthError, authErrorOr} from "@http4t/bidi/auth/authError";
import {orNotFound, response} from "@http4t/bidi/responses";
import {v} from "@http4t/bidi/paths/variables";
import {HttpHandler} from "@http4t/core/contract";
import {tokenProvidedRoutes} from "@http4t/bidi/auth/client";
import {buildClient} from "@http4t/bidi/client";
import {SecuredApi} from "@http4t/bidi/auth/withSecurity";

export type Doc = {
    id: string;
    document: any;
}

export interface DocStore {
    post(request: Doc): Promise<Result<AuthError, { id: string }>>;

    get(request: { id: string }): Promise<Result<AuthError, Doc | undefined>>;

    storeDocThenFail(request: Doc): Promise<Result<AuthError, undefined>>;
}

export const docStoreRoutes: RoutesFor<SecuredApi<DocStore, JwtString>> = jwtRoutes({
    post: route(
        request('POST', '/store', json<Doc>()),
        authErrorOr(
            response(201, json<{ id: string }>()))
    ),
    get: route(
        request('GET', path({id: v.segment}, p => ["store", p.id])),
        authErrorOr(
            orNotFound(json<Doc>()))
    ),
    storeDocThenFail: route(
        request("POST", '/test/store-then-throw', json<Doc>()),
        authErrorOr(
            response(200, empty())))
});

export function docStoreClient(httpClient: HttpHandler, jwt: JwtString): DocStore {
    const routesWithJwtProvided = tokenProvidedRoutes(
        docStoreRoutes,
        jwt);

    return buildClient(
        routesWithJwtProvided,
        httpClient,
        {leakActualValuesInError: true});
}