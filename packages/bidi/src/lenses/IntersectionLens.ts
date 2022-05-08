import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export class IntersectionLens<
    TMessage extends HttpMessage,

    AGet extends object | undefined,
    BGet extends object | undefined,

    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet>
    implements MessageLens<TMessage, AGet & BGet, ASet & BSet> {

    constructor(private readonly a: MessageLens<TMessage, AGet, ASet>,
                private readonly b: MessageLens<TMessage, BGet, BSet>) {
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
        return this.b.set(await this.a.set(into, value), value);
    }
}

export function intersect<
    TMessage extends HttpMessage,
    AGet extends object | undefined,
    BGet extends object | undefined,

    ASet extends object | undefined = AGet,
    BSet extends object | undefined = BGet>(

    a: MessageLens<TMessage, AGet, ASet>,
    b: MessageLens<TMessage, BGet, BSet>): MessageLens<TMessage, AGet & BGet, ASet & BSet> {
    return new IntersectionLens(a, b);
}