import {ResponseLens} from "../lenses";
import {Result} from "@http4t/result";
import {result} from "../lenses/ResultLens";
import {statuses} from "../lenses/ResponseByStatusLens";
import {json} from "../lenses/JsonLens";
import {HandlerFn1} from "../routes";

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

export * from "./server"
export * from "./client"
export type UnsecuredFn<THandler> = THandler extends HandlerFn1<WithClaims<infer In, infer TClaims>,
        Result<infer TAuthError, infer Out>>

    ? (req: In) => Promise<Result<TAuthError, Out>>

    : never;
//TODO: can we delete this?
export type Unsecured<TApi> = { [K in keyof TApi]: UnsecuredFn<TApi[K]> }