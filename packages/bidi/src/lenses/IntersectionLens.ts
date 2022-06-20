import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export class IntersectionLens<TMessage extends HttpMessage,
    A extends object | undefined,
    B extends object | undefined>
    implements MessageLens<TMessage, A & B> {

    constructor(private readonly a: MessageLens<TMessage, A>,
                private readonly b: MessageLens<TMessage, B>) {
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
        return this.b.set(await this.a.set(into, value), value);
    }
}

export function intersect<TMessage extends HttpMessage,
    A extends object | undefined,
    B extends object | undefined>(
    a: MessageLens<TMessage, A>,
    b: MessageLens<TMessage, B>): MessageLens<TMessage, A & B> {
    return new IntersectionLens(a, b);
}