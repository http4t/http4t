import {HttpMessage, HttpRequest, HttpResponse} from "@http4t/core/contract";
import * as responses from "@http4t/core/responses";
import {failure, Failure, Result} from "@http4t/result";
import {JsonPath, problem, Problem} from "@http4t/result/JsonPathResult";


export const WRONG_ROUTE = "wrong-route";
export const ROUTE_FAILED = "route-failed";

/**
 * This was the wrong route- usually because either the url or method did not match.
 *
 * The Router should continue looking for a matching route
 */
export type WrongRoute = {
    readonly type: typeof WRONG_ROUTE,
    readonly problems: Problem[]
};

/**
 * This was the right route to handle the request, but the request is not valid for this route (e.g. the url and method
 * matched but the body is not valid json)
 *
 * The Router should not consider any more routes, and should return the provided response to the user
 */
export type RouteFailed = {
    readonly type: typeof ROUTE_FAILED,
    readonly problems: Problem[],
    readonly response: HttpResponse
};

export type RoutingError = WrongRoute | RouteFailed;
export type RoutingResult<T = unknown> = Result<RoutingError, T>;

export function wrongRouteError(message: string, path: (string | number)[] = []): WrongRoute {
    return {type: WRONG_ROUTE, problems: [problem(message, path)]};
}

export function wrongRoute(message: string, path: JsonPath): Failure<RoutingError> {
    return failure(wrongRouteError(message, path));
}

export function routeFailedError(message: string, path: JsonPath, response: HttpResponse): RouteFailed {
    return {
        type: ROUTE_FAILED,
        problems: [problem(message, path)],
        response
    };
}

export function routeFailed(message: string, path: JsonPath, response: HttpResponse = responses.responseOf(400, message)): Failure<RoutingError> {
    return failure(routeFailedError(message, path, response));
}

/**
 * A lens is something that, for example, knows:
 *
 * - How to both extract a named header from an http request, and how to add it
 *
 * - Or how to deserialize a request body into an object, and how to serialize
 *   the same type of object, and put it into a request body
 *
 * It's useful because the same lens can be used on the client side to
 * inject the header or body into the request, and on the server side to
 * read out the header, or deserialise the body.
 *
 * By using the same lenses to:
 *
 * - Create requests in the client and to parse them on the server
 * - Create responses on the server and parse them on the client
 *
 * ...we ensure that the server and client always understand one another
 */
export interface MessageLens<TMessage extends HttpMessage = HttpMessage, T = unknown> {
    get(from: TMessage): Promise<RoutingResult<T>>;

    set<SetInto extends TMessage>(into: SetInto, value: T): Promise<SetInto>;
}

export interface RequestLens<T= unknown> extends MessageLens<HttpRequest, T> {
}

export abstract class BaseRequestLens<T = unknown> implements RequestLens<T> {
    abstract get(from: HttpRequest): Promise<RoutingResult<T>>;

    set<SetInto extends HttpRequest>(into: SetInto, value: T): Promise<SetInto> {
        return this.setRequest(into, value) as Promise<SetInto>;
    }

    abstract setRequest(into: HttpRequest, value: T): Promise<HttpRequest>;
}

export interface ResponseLens<T = unknown> extends MessageLens<HttpResponse, T> {
}

export abstract class BaseResponseLens<T = unknown> implements ResponseLens<T> {
    abstract get(from: HttpResponse): Promise<RoutingResult<T>>;

    set<SetInto extends HttpResponse>(into: SetInto, value: T): Promise<SetInto> {
        return this.setResponse(into, value) as Promise<SetInto>;
    }

    abstract setResponse(into: HttpResponse, value: T): Promise<HttpResponse>;
}
