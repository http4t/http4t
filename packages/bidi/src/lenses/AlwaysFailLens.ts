import {HttpMessage} from "@http4t/core/contract";
import {failure} from "@http4t/result";
import {MessageLens, RoutingError, RoutingResult} from "../lenses";

class AlwaysFailLens<TMessage extends HttpMessage, TGet = never, TSet = TGet> implements MessageLens<TMessage, TGet, TSet> {
    constructor(private readonly error: (message: TMessage) => RoutingError) {

    }

    async get(message: TMessage): Promise<RoutingResult<TGet>> {
        return failure(this.error(message));
    }

    async set<SetInto extends TMessage>(into: SetInto, value: TSet): Promise<SetInto> {
        return into;
    }
}

export function fail<TMessage extends HttpMessage = HttpMessage, TGet = never, TSet = TGet>(error: RoutingError): MessageLens<TMessage, TGet, TSet>;
export function fail<TMessage extends HttpMessage = HttpMessage, TGet = never,TSet = TGet>(error: (message: TMessage) => RoutingError): MessageLens<TMessage, TGet, TSet>;
export function fail<TMessage extends HttpMessage = HttpMessage, TGet = never,TSet = TGet>(error: RoutingError | ((message: TMessage) => RoutingError)): MessageLens<TMessage, TGet, TSet> {
    return new AlwaysFailLens<TMessage, TGet, TSet>(typeof error === "function" ? error : () => error);
}
