import {Result} from "@http4t/result";
import {Jwt, jwtBody, JwtStrategy, JwtString} from "@http4t/bidi-jwt";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {json, request, result, text} from "@http4t/bidi/requests";
import {response} from "@http4t/bidi/responses";
import {HttpHandler} from "@http4t/core/contract";
import {buildClient} from "@http4t/bidi/client";
import {clientJwt} from "@http4t/bidi-jwt/jose";
import {WithSecurity} from "@http4t/bidi/auth/withSecurity";

export type DocStoreClaims = {
    principal: { type: "user", userName: string }
}
export type WithOurClaims<T> = WithSecurity<T, DocStoreClaims>;
export type Creds = { userName: string, password: string };

export type User = {
    userName: string
}

export interface Auth {
    register(request: Creds): Promise<Result<string, User>>
}

export interface AuthServer extends Auth {
    login(request: Creds): Promise<Result<string, Jwt>>
}

export interface AuthClient extends Auth {
    login(request: Creds): Promise<Result<string, JwtString>>
}

export function authRoutes(opts: { jwt: JwtStrategy }): RoutesFor<AuthServer, AuthClient> {
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

export function authClient(httpClient: HttpHandler): AuthClient {
    return buildClient(authRoutes({jwt: clientJwt()}), httpClient, {leakActualValuesInError: true});
}