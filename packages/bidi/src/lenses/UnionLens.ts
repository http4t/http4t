import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";
import {failure, isFailure, isSuccess} from "@http4t/result";

export class UnionLens<AGet extends object | undefined,
    BGet extends object | undefined,
    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet,
    TMessage extends HttpMessage = HttpMessage>
    implements MessageLens<TMessage, AGet | BGet, ASet | BSet> {

    constructor(
        private a: MessageLens<TMessage, AGet, ASet>,
        private b: MessageLens<TMessage, BGet, BSet>,
        private isA: (value: ASet | BSet) => value is ASet
    ) {
    }

    async get(from: TMessage): Promise<RoutingResult<AGet | BGet>> {
        const a = await this.a.get(from);
        if (isSuccess(a)) return a;

        const b = await this.b.get(from);
        if (isFailure(b)) return failure({...b.error, problems: [...a.error.problems, ...b.error.problems]})
        return b;
    }

    async set<SetInto extends TMessage>(into: SetInto, value: ASet | BSet): Promise<SetInto> {
        if (this.isA(value)) return this.a.set(into, value)
        return this.b.set(into, value);
    }
}

export function union<AGet extends object | undefined,
    BGet extends object | undefined,
    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet,
    TMessage extends HttpMessage = HttpMessage>
(
    a: MessageLens<TMessage, AGet, ASet>,
    b: MessageLens<TMessage, BGet, BSet>,
    isA: (value: ASet | BSet) => value is ASet)

    : MessageLens<TMessage, AGet | BGet, ASet | BSet> {

    return new UnionLens(a, b, isA)
}