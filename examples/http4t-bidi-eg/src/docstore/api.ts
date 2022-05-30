import {HttpHandler} from "@http4t/core/contract";
import {Jwt, jwtSecuredRoutes, JwtStrategy} from "@http4t/bidi-jwt";
import {Unsecured} from "@http4t/bidi/auth/withSecurity";
import {clientJwt} from "@http4t/bidi-jwt/jose";
import {tokenProvidedRoutes} from "@http4t/bidi/auth/client";
import {buildClient} from "@http4t/bidi/client";
import {DocStoreClaims, WithOurClaims} from "../auth/api";
import {Doc} from "./impl/DocRepository";
import {Result, success} from "@http4t/result";
import {AuthError, authErrorOr} from "@http4t/bidi/auth/authError";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {empty, json, path, request} from "@http4t/bidi/requests";
import {orNotFound, response} from "@http4t/bidi/responses";
import {v} from "@http4t/bidi/paths/variables";
import {SecuredRoutesFor} from "@http4t/bidi/auth/server";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";

export interface DocStore {
    post(request: WithOurClaims<Doc>): Promise<Result<AuthError, { id: string }>>;

    get(request: WithOurClaims<{ id: string }>): Promise<Result<AuthError, Doc | undefined>>;

    storeDocThenFail(request: WithOurClaims<Doc>): Promise<Result<AuthError, undefined>>;
}

export const unsecuredDocStoreRoutes: RoutesFor<Unsecured<DocStore>> = {
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
}

export function docStoreRoutes(opts: { jwt: JwtStrategy }): SecuredRoutesFor<typeof unsecuredDocStoreRoutes, Jwt, DocStoreClaims> {
    return jwtSecuredRoutes(
        unsecuredDocStoreRoutes,
        opts.jwt,
        async (jwt: Jwt): Promise<RoutingResult<DocStoreClaims>> => {
            const userName = jwt.payload["userName"];
            if (!userName) return routeFailed("JWT did not contain 'userName'", ["headers", "Authorization"]);
            return success({
                principal: {
                    type: "user",
                    userName: userName
                }
            })
        });
}

export function docStoreClient(httpClient: HttpHandler, jwt: Jwt): Unsecured<DocStore> {
    const securedRoutes = docStoreRoutes({
        jwt: clientJwt()
    });

    const routesWithJwtProvided = tokenProvidedRoutes(
        securedRoutes,
        jwt);

    return buildClient(
        routesWithJwtProvided,
        httpClient,
        {leakActualValuesInError: true});
}