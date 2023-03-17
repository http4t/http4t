import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export class IntersectionLens<TMessage extends HttpMessage,
    AGet extends object | undefined,
    BGet extends object | undefined,
    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet>
    implements MessageLens<TMessage, AGet & BGet, ASet & BSet> {

    constructor(private readonly a: MessageLens<TMessage, AGet, ASet>,
                private readonly b: MessageLens<TMessage, BGet, BSet>,
                private readonly unintersectA: (intersected: ASet & BSet) => Promise<ASet> | ASet,
                private readonly unintersectB: (intersected: ASet & BSet) => Promise<BSet> | BSet
    ) {
    }

    async get(message: TMessage): Promise<RoutingResult<AGet & BGet>> {
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

    async set<SetInto extends TMessage>(into: SetInto, value: ASet & BSet): Promise<SetInto> {
        const a = await this.a.set(into, await this.unintersectA(value));
        return this.b.set(a, await this.unintersectB(value));
    }
}

export function intersect<TMessage extends HttpMessage,
    AGet extends object | undefined,
    ASet extends object | undefined = AGet>(
    a: MessageLens<TMessage, AGet, ASet>,
    b: MessageLens<TMessage, undefined, undefined>): MessageLens<TMessage, AGet, ASet>;

export function intersect<TMessage extends HttpMessage,
    BGet extends object | undefined,
    BSet extends object | undefined = BGet>(
    a: MessageLens<TMessage, undefined, undefined>,
    b: MessageLens<TMessage, BGet, BSet>): MessageLens<TMessage, BGet, BSet>;

export function intersect<TMessage extends HttpMessage,
    AGet extends object | undefined,
    BGet extends object | undefined,
    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet>(
    a: MessageLens<TMessage, AGet, ASet>,
    b: MessageLens<TMessage, BGet, BSet>,
    unintersectA: (intersected: ASet & BSet) => Promise<ASet> | ASet,
    unintersectB: (intersected: ASet & BSet) => Promise<BSet> | BSet): MessageLens<TMessage, AGet & BGet, ASet & BSet>;

export function intersect<TMessage extends HttpMessage,
    AGet extends object | undefined,
    BGet extends object | undefined,
    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet>(
    a: MessageLens<TMessage, AGet, ASet>,
    b: MessageLens<TMessage, BGet, BSet>,
    unintersectA?: (intersected: ASet & BSet) => Promise<ASet> | ASet,
    unintersectB?: (intersected: ASet & BSet) => Promise<BSet> | BSet): MessageLens<TMessage, AGet & BGet, ASet & BSet> {

    const unintersectA1 = unintersectA
        || (async (_) => undefined) as (intersected: ASet & BSet) => Promise<ASet>;

    const unintersectB1 = unintersectB
        || (async (ab) => ab) as (intersected: ASet & BSet) => Promise<BSet>;

    return new IntersectionLens<TMessage, AGet, BGet, ASet, BSet>(a, b, unintersectA1 as any, unintersectB1 as any);
}