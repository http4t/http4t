import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export class IntersectionLens<TMessage extends HttpMessage,
    A extends object | undefined,
    B extends object | undefined>
    implements MessageLens<TMessage, A & B> {

    constructor(private readonly a: MessageLens<TMessage, A>,
                private readonly b: MessageLens<TMessage, B>,
                private readonly unintersectA: (intersected: A & B) => Promise<A> | A,
                private readonly unintersectB: (intersected: A & B) => Promise<B> | B
    ) {
    }

    async get(message: TMessage): Promise<RoutingResult<A & B>> {
        const aResult = await this.a.get(message);

        if (isFailure(aResult)) {
            return aResult;
        }

        const bResult = await this.b.get(message);
        if (isFailure(bResult)) {
            return bResult;
        }

        return success(aResult.value === undefined && bResult.value === undefined ? undefined as any : {...aResult.value, ...bResult.value});
    }

    async set<SetInto extends TMessage>(into: SetInto, value: A & B): Promise<SetInto> {
        const a = await this.a.set(into, await this.unintersectA(value));
        return this.b.set(a, await this.unintersectB(value));
    }
}

export function intersect<TMessage extends HttpMessage,
    A extends object | undefined>(
    a: MessageLens<TMessage, A>,
    b: MessageLens<TMessage, undefined>): MessageLens<TMessage, A>;

export function intersect<TMessage extends HttpMessage,
    B extends object | undefined>(
    a: MessageLens<TMessage, undefined>,
    b: MessageLens<TMessage, B>): MessageLens<TMessage, B>;

export function intersect<TMessage extends HttpMessage,
    A extends object | undefined,
    B extends object | undefined>(
    a: MessageLens<TMessage, A>,
    b: MessageLens<TMessage, B>,
    unintersectA: (intersected: A & B) => Promise<A> | A,
    unintersectB: (intersected: A & B) => Promise<B> | B): MessageLens<TMessage, A & B>;

export function intersect<TMessage extends HttpMessage,
    A extends object | undefined,
    B extends object | undefined>(
    a: MessageLens<TMessage, A>,
    b: MessageLens<TMessage, B>,
    unintersectA?: (intersected: A & B) => Promise<A> | A,
    unintersectB?: (intersected: A & B) => Promise<B> | B): MessageLens<TMessage, A & B> {

    const unintersectA1 = unintersectA
        || (async (_) => undefined) as (intersected: A & B) => Promise<A>;

    const unintersectB1 = unintersectB
        || (async (ab) => ab) as (intersected: A & B) => Promise<B>;

    return new IntersectionLens<TMessage, A, B>(a, b, unintersectA1 as any, unintersectB1 as any);
}