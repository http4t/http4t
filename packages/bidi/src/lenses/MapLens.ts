import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";
import {isSuccess} from "@http4t/result";

export class MapLens<A = unknown, B = unknown, TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, B> {
    constructor(private readonly a: MessageLens<TMessage, A>,
                private readonly getter: (a: A) => Promise<RoutingResult<B>> | RoutingResult<B>,
                private readonly setter: (b: B) => Promise<A> | A) {
    }

    async get(from: TMessage): Promise<RoutingResult<B>> {
        const result = await this.a.get(from);
        return isSuccess(result)
            ? await this.getter(result.value)
            : result;
    }

    async set<SetInto extends TMessage>(into: SetInto, value: B): Promise<SetInto> {
        return this.a.set(into, await this.setter(value));
    }
}

export function mapped<A = unknown, B = unknown, TMessage extends HttpMessage = HttpMessage>(
    a: MessageLens<TMessage, A>,
    getter: (a: A) => Promise<RoutingResult<B>> | RoutingResult<B>,
    setter: (b: B) => Promise<A> | A): MessageLens<TMessage, B> {

    return new MapLens(a, getter, setter);
}