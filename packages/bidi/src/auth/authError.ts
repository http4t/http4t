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

/**
 * Gets/sets {@link AuthError} as json response body, with {@link AuthError#reason} mapped to response codes of:
 *
 * * 'unauthorized' <-> 401
 * * 'forbidden' <-> 403
 */
export function authError(): ResponseLens<AuthError> {
    return statuses({
            401: json<AuthError>(),
            403: json<AuthError>()
        },
        authError => {
            const reason = authError.reason;
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

export function authErrorOr<T>(successLens: ResponseLens<T>): ResponseLens<Result<AuthError, T>> {
    return result(
        authError(),
        successLens);
}