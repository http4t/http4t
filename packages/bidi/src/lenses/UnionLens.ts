import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";
import {failure, isFailure, isSuccess} from "@http4t/result";

export class UnionLens<A extends object | undefined,
    B extends object | undefined,
    TMessage extends HttpMessage = HttpMessage>
    implements MessageLens<TMessage, A | B> {

    constructor(
        private a: MessageLens<TMessage, A>,
        private b: MessageLens<TMessage, B>,
        private isA: (value: A | B) => value is A
    ) {
    }

    async get(from: TMessage): Promise<RoutingResult<A | B>> {
        const a = await this.a.get(from);
        if (isSuccess(a)) return a;

        const b = await this.b.get(from);
        if (isFailure(b)) return failure({...b.error, problems: [...a.error.problems, ...b.error.problems]})
        return b;
    }

    async set<SetInto extends TMessage>(into: SetInto, value: A | B): Promise<SetInto> {
        if (this.isA(value)) return this.a.set(into, value)
        return this.b.set(into, value);
    }
}

export function union<A extends object | undefined,
    B extends object | undefined,
    TMessage extends HttpMessage = HttpMessage>
(
    a: MessageLens<TMessage, A>,
    b: MessageLens<TMessage, B>,
    isA: (value: A | B) => value is A)

    : MessageLens<TMessage, A | B> {

    return new UnionLens(a, b, isA)
}