import {HttpMessage} from "@http4t/core/contract";
import {success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export class EmptyLens<TMessage extends HttpMessage> implements MessageLens<TMessage, undefined> {
    async get(_message: TMessage): Promise<RoutingResult<undefined>> {
        return success(undefined);
    }

    async set(into: TMessage, _value: undefined): Promise<TMessage> {
        return into;
    }
}

export function empty<TMessage extends HttpMessage = HttpMessage>(): EmptyLens<TMessage> {
    return new EmptyLens<TMessage>();
}
