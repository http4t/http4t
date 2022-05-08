import {HttpMessage} from "@http4t/core/contract";
import {MessageLens, RoutingResult} from "../lenses";
import {isSuccess} from "@http4t/result";

export class MapLens<AGet, BGet, ASet = AGet, BSet = BGet, TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, BGet, BSet> {
    constructor(private readonly a: MessageLens<TMessage, AGet, ASet>,
                private readonly getter: (a: AGet) => Promise<RoutingResult<BGet>>,
                private readonly setter: (b: BSet) => Promise<ASet> | ASet) {
    }

    async get(from: TMessage): Promise<RoutingResult<BGet>> {
        const result = await this.a.get(from);
        return isSuccess(result) ? await this.getter(result.value) : result;
    }

    async set<SetInto extends TMessage>(into: SetInto, value: BSet): Promise<SetInto> {
        return this.a.set(into, await this.setter(value));
    }
}

export function mapped<AGet, BGet, ASet = AGet, BSet = BGet, TMessage extends HttpMessage = HttpMessage>(
    a: MessageLens<TMessage, AGet, ASet>,
    getter: (a: AGet) => Promise<RoutingResult<BGet>>,
    setter: (b: BSet) => Promise<ASet> | ASet): MessageLens<TMessage, BGet, BSet> {

    return new MapLens(a, getter, setter);
}