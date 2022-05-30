import {header, json, result, text, value} from "@http4t/bidi/messages";
import {empty, orNotFound, response} from "@http4t/bidi/responses";
import {path} from "@http4t/bidi/paths";
import {v} from "@http4t/bidi/paths/variables";
import {request} from "@http4t/bidi/requests";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {HttpHandler} from "@http4t/core/contract";
import {Doc} from "./docstore";
import {Result, success} from "@http4t/result";
import {Jwt, jwtBody, jwtSecuredRoutes, JwtStrategy} from "@http4t/bidi-jwt";
import {buildClient} from "@http4t/bidi/client";
import {SecuredRoutesFor} from "@http4t/bidi/auth/server";
import {tokenProvidedRoutes} from "@http4t/bidi/auth/client";

import {clientJwt} from "@http4t/bidi-jwt/jose";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {Unsecured, WithSecurity} from "@http4t/bidi/auth/withSecurity";
import {AuthError, authErrorOr} from "@http4t/bidi/auth/authError";

export type User = {
    userName: string
}

export type DocStoreClaims = {
    principal: { type: "user", userName: string }
}

export type WithOurClaims<T> = WithSecurity<T, DocStoreClaims>;

export type Creds = { userName: string, password: string };

export interface Auth {
    register(request: Creds): Promise<Result<string, User>>

    login(request: Creds): Promise<Result<string, Jwt>>
}

export interface Health {
    ready(): Promise<undefined>;

    live(): Promise<undefined>;
}

export interface DocStore {
    post(request: WithOurClaims<Doc>): Promise<Result<AuthError, { id: string }>>;

    get(request: WithOurClaims<{ id: string }>): Promise<Result<AuthError, Doc | undefined>>;

    storeDocThenFail(request: WithOurClaims<Doc>): Promise<Result<AuthError, undefined>>;
}

export interface FullApi extends Health, Auth, DocStore {
}

export function authRoutes(opts: { jwt: JwtStrategy }): RoutesFor<Auth> {
    return {
        register: route(
            request("POST", "/register", json<Creds>()),
            result(
                response(400, text()),
                response(200, json<User>())
            )
        ),
        login: route(
            request("POST", "/login", json<Creds>()),
            result(
                response(403, text()),
                response(200, jwtBody(opts.jwt)))
        )
    };
}

export const healthRoutes: RoutesFor<Health> = {
    ready: route(
        request('GET', '/probe/ready'),
        response(200, value("*", header("Access-Control-Allow-Origin")))
    ),
    live: route(
        request('GET', '/probe/live'),
        response(200, value("*", header("Access-Control-Allow-Origin")))
    ),
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
            response(200, empty()))
    )
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

export function authClient(httpClient: HttpHandler): Auth {
    return buildClient(authRoutes({jwt: clientJwt()}), httpClient, {leakActualValuesInError: true});
}

export function healthClient(httpClient: HttpHandler): Health {
    return buildClient(healthRoutes, httpClient, {leakActualValuesInError: true});
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