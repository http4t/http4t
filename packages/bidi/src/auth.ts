import {HandlerFn1, route, Route, Routes} from "./routes";
import {isFailure, Result, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, ResponseLens, RoutingResult} from "./lenses";
import {statuses} from "./lenses/ResponseByStatusLens";
import {json} from "./lenses/JsonLens";
import {HttpRequest} from "@http4t/core/contract";
import {result} from "./lenses/ResultLens";

/**
 * A default type for TAuthError, if you don't want to roll your own
 */
export type AuthError = {
    reason: 'unauthorized' | 'forbidden'
    message: string
}

export function authError(): ResponseLens<AuthError> {
    return statuses({
        401: json<AuthError>(),
        403: json<AuthError>()
    }, value => {
        switch (value.reason) {
            case "unauthorized":
                return 401;
            case "forbidden":
                return 403;
            default:
                return "exhaustive check" as never;
        }
    })
}

export function authErrorOr<T>(successLens: ResponseLens<T>): ResponseLens<Result<AuthError, T>> {
    return result(
        authError(),
        successLens);
}

export type WithClaims<T, TClaims> = {
    claims: TClaims
    value: T
}

export type UnsecuredFn<T> = T extends HandlerFn1<WithClaims<infer In, infer TClaims>, Result<infer TAuthError, infer Out>>
    ? (req: In) => Promise<Result<TAuthError, Out>>
    : never;

export type Unsecured<T> = { [K in keyof T]: UnsecuredFn<T[K]> }

export class ServerSecuredRequestLens<T, TToken, TClaims> extends BaseRequestLens<WithClaims<T, TClaims>, WithClaims<T, TToken>> {
    constructor(private readonly unsecuredLens: RequestLens<T>,
                private readonly tokenLens: RequestLens<TClaims, TToken>) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<WithClaims<T, TClaims>>> {
        const routeResult = await this.unsecuredLens.get(from);
        if (isFailure(routeResult)) return routeResult;

        const claimsResult = await this.tokenLens.get(from);
        if (isFailure(claimsResult)) return claimsResult;

        return success({claims: claimsResult.value, value: routeResult.value});
    }

    async setRequest(into: HttpRequest, value: WithClaims<T, TToken>): Promise<HttpRequest> {
        const withToken = await this.tokenLens.set(into, value.claims);
        return this.unsecuredLens.set(withToken, value.value)
    }
}

export function serverSecuredRoute<In, Out, TToken, TClaims, TAuthError>(
    unsecuredRoute: Route<In, Result<TAuthError, Out>>,
    tokenLens: RequestLens<TClaims, TToken>)

    : Route<WithClaims<In, TClaims>, Result<TAuthError, Out>, WithClaims<In, TToken>> {

    return route(
        new ServerSecuredRequestLens(unsecuredRoute.request, tokenLens),
        unsecuredRoute.response);
}

export function serverSecuredRoutes<T, TToken, TClaims, TAuthError>(
    unsecuredRoutes: Routes<Unsecured<T>>,
    tokenLens: RequestLens<TToken, TClaims>)

    : Routes<T> {

    return Object.entries(unsecuredRoutes).reduce(
        (previousValue, [k, route]) => {
            const secured = serverSecuredRoute(
                route as Route<unknown, Result<TAuthError, unknown>>,
                tokenLens);
            return Object.assign({}, previousValue, {[k]: secured})
        },
        {} as Routes<T>);
}

export type TokenSupplied<T, TToken> = { [K in keyof T]: UnsecuredFn<T[K]> }

export function provideTokenForFn<In, Out, TToken, TAuthError>(
    fn: HandlerFn1<WithClaims<In, TToken>, Result<TAuthError, Out>>,
    token: TToken)
    : (req: In) => Promise<Result<TAuthError, Out>> {
    return (value: In) => fn({claims: token, value})
}

export function provideToken<T, TToken>(api: T, token: TToken): Unsecured<T> {
    return Object.entries(api).reduce(
        (previousValue, [k, fn]) => {
            const secured = provideTokenForFn(
                fn,
                token);
            return Object.assign({}, previousValue, {[k]: secured})
        },
        {} as TokenSupplied<T, TToken>)
}