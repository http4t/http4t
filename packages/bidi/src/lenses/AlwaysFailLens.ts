import {HttpMessage} from "@http4t/core/contract";
import {failure} from "@http4t/result";
import {MessageLens, RoutingError, RoutingResult} from "../lenses";

class AlwaysFailLens<TMessage extends HttpMessage, T = unknown> implements MessageLens<TMessage, T> {
    constructor(private readonly error: (message: TMessage) => RoutingError) {

    }

    async get(message: TMessage): Promise<RoutingResult<T>> {
        return failure(this.error(message));
    }

    async set<SetInto extends TMessage>(into: SetInto, value: T): Promise<SetInto> {
        return into;
    }
}

export function fail<TMessage extends HttpMessage = HttpMessage, T = unknown>(error: RoutingError): MessageLens<TMessage, T>;
export function fail<TMessage extends HttpMessage = HttpMessage, T = unknown>(error: (message: TMessage) => RoutingError): MessageLens<TMessage, T>;
export function fail<TMessage extends HttpMessage = HttpMessage, T = unknown>(error: RoutingError | ((message: TMessage) => RoutingError)): MessageLens<TMessage, T> {
    return new AlwaysFailLens<TMessage, T>(typeof error === "function" ? error : () => error);
}
