import {ResponseLens} from "../lenses";
import {statuses} from "../lenses/ResponseByStatusLens";
import {json} from "../lenses/JsonLens";
import {Result} from "@http4t/result";
import {result} from "../lenses/ResultLens";
import {assertExhaustive} from "@http4t/core/util/assertExhaustive";

/**
 * A default type for `TAuthError`, if you don't want to roll your own
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
        const reason = value.reason;
        switch (reason) {
            case "unauthorized":
                return 401;
            case "forbidden":
                return 403;
            default:
                return assertExhaustive(reason);
        }
    })
}

/**
 * {@param successLens} will be matched first, so it'll be able to handle more specific `401` and `403` responses
 * before returning {@link AuthError}, although this is a little confusing, and not recommended
 */
export function authErrorOr<T>(successLens: ResponseLens<T>): ResponseLens<Result<AuthError, T>> {
    return result(
        authError(),
        successLens);
}