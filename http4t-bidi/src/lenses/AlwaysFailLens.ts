import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";

class FailOnGetLens<TMessage extends HttpMessage, T = never> implements MessageLens<TMessage, T> {
    constructor(private readonly error: (message: TMessage) => RoutingResult<T>) {

    }

    async get(message: TMessage): Promise<RoutingResult<T>> {
        return this.error(message);
    }

    async set(into: TMessage, value: T): Promise<TMessage> {
        return into;
    }
}

export function fail<TMessage extends HttpMessage = HttpMessage, T = never>(error: RoutingResult<T>): MessageLens<TMessage, T>;
export function fail<TMessage extends HttpMessage = HttpMessage, T = never>(error: (message: TMessage) => RoutingResult<T>): MessageLens<TMessage, T>;
export function fail<TMessage extends HttpMessage = HttpMessage, T = never>(error: RoutingResult<T> | ((message: TMessage) => RoutingResult<T>)): MessageLens<TMessage, T> {
    return new FailOnGetLens<TMessage, T>(typeof error === "function" ? error : () => error);
}