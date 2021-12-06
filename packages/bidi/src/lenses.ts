import {HttpMessage, HttpRequest, HttpResponse} from "@http4t/core/contract";
import * as responses from "@http4t/core/responses";
import {failure, Failure, Result} from "@http4t/result";
import {JsonPath, problem, Problem} from "@http4t/result/JsonPathResult";

export const WRONG_ROUTE = "wrong-route";

export type WrongRoute = {
    readonly type: typeof WRONG_ROUTE,
    readonly problems: Problem[]
};

export type RouteFailed = {
    readonly type: "route-failed",
    readonly problems: Problem[],
    readonly response: HttpResponse
};

export type RoutingError = WrongRoute | RouteFailed;
export type RoutingResult<T> = Result<RoutingError, T>;

export function wrongRouteError(message: string, path: (string | number)[]): WrongRoute {
    return {type: "wrong-route", problems: [problem(message, path)]};
}

export function wrongRoute(message: string, path: JsonPath): Failure<RoutingError> {
    return failure(wrongRouteError(message, path));
}

export function routeFailedError(message: string, path: JsonPath, response: HttpResponse): RouteFailed {
    return {
        type: "route-failed",
        problems: [problem(message, path)],
        response
    };
}

export function routeFailed(message: string, path: JsonPath, response: HttpResponse = responses.responseOf(400, message)): Failure<RoutingError> {
    return failure(routeFailedError(message, path, response));
}

/**
 * A lens is something that, for example, knows how to both extract a named
 * header from an http request, and how to add it to a request.
 *
 * Or how to deserialize a request body into an object, and how to serialize
 * the same type of object, and put it into a request body.
 *
 * It's useful because the same lens can be used on the client side to
 * inject the header or body into the request, and on the server side to
 * read out the header, or deserialise the body.
 */
export interface MessageLens<TMessage extends HttpMessage = HttpMessage, T = unknown> {
    get(from: TMessage): Promise<RoutingResult<T>>;
    set(into: TMessage, value: T): Promise<TMessage>;
}

export interface RequestLens<T> extends MessageLens<HttpRequest, T> {
}

export interface ResponseLens<T> extends MessageLens<HttpResponse, T> {
}
