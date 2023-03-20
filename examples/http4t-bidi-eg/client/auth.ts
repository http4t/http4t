import {HttpHandler} from "@http4t/core/contract";
import {buildClient} from "@http4t/bidi/client";
import {WithSecurity} from "@http4t/bidi/auth/withSecurity";
import {Result} from "@http4t/result";
import {JwtString} from "@http4t/bidi-jwt";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {json, request, result, text} from "@http4t/bidi/requests";
import {response} from "@http4t/bidi/responses";

export type DocStoreClaims = {
    principal: { type: "user", userName: string }
}

export type WithDocStoreClaims<T> = WithSecurity<T, DocStoreClaims>;

export type Credentials = { userName: string, password: string };

export type User = {
    userName: string
}

export interface Auth {
    register(request: Credentials): Promise<Result<string, User>>

    login(request: Credentials): Promise<Result<string, JwtString>>
}

export function authRoutes(): RoutesFor<Auth> {
    return {
        register: route(
            request("POST", "/register", json<Credentials>()),
            result(
                response(400, text()),
                response(200, json<User>())
            )
        ),
        login: route(
            request("POST", "/login", json<Credentials>()),
            result(
                response(403, text()),
                response(200, text()))
        )
    };
}

export function authClient(httpClient: HttpHandler): Auth {
    return buildClient(authRoutes(), httpClient, {leakActualValuesInError: true});
}