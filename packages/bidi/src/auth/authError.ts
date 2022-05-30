import {ResponseLens} from "../lenses";
import {statuses} from "../lenses/ResponseByStatusLens";
import {json} from "../lenses/JsonLens";
import {Result} from "@http4t/result";
import {result} from "../lenses/ResultLens";

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