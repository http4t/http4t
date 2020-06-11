import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";
import {isSuccess} from "@http4t/result";

export class UnionLens<TMessage extends HttpMessage, A, B> implements MessageLens<TMessage, A | B> {
    constructor(
        private a: MessageLens<TMessage, A>,
        private b: MessageLens<TMessage, B>,
        private isA: (value: A | B) => value is A
    ) {
    }

    async get(from: TMessage): Promise<RoutingResult<A | B>> {
        const a = await this.a.get(from);
        if (isSuccess(a)) return a;
        return this.b.get(from);
    }

    async set(into: TMessage, value: A | B): Promise<TMessage> {
        if (this.isA(value)) return this.a.set(into, value)
        return this.b.set(into, value);
    }
}
