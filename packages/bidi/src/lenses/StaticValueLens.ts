import {HttpMessage} from "@http4t/core/contract";
import {failure, isFailure, success} from "@http4t/result";
import {MessageLens, routeFailedError, RoutingError, RoutingResult} from "../lenses";
import {responseOf} from "@http4t/core/responses";

export type StaticValueOpts<TGet, TSet> = {
    equality: (expected: TSet, actual: TGet) => boolean,
    failure: (value: TGet) => RoutingError
};

function defaults<TGet, TSet=TGet>(value: TSet): StaticValueOpts<TGet, TSet> {
    return {
        equality: (a: TSet, b: TGet) => a as any === b,
        failure: v => routeFailedError(`Expected: ${value}, but got: ${v}`, [], responseOf(400))
    };
}

export class StaticValueLens<TGet, TSet = TGet, TMessage extends HttpMessage = HttpMessage> implements MessageLens<TMessage, undefined> {
    private readonly opts: StaticValueOpts<TGet, TSet>;

    constructor(private readonly value: TSet,
                private readonly lens: MessageLens<TMessage, TGet, TSet>,
                opts: Partial<StaticValueOpts<TGet, TSet>>) {
        this.opts = Object.assign({}, defaults(value), opts);
    }

    async get(from: TMessage): Promise<RoutingResult<undefined>> {
        const actual = await this.lens.get(from);
        if (isFailure(actual)) return actual;
        if (this.opts.equality(this.value, actual.value)) {
            return success(undefined);
        }
        return failure(this.opts.failure(actual.value));
    }

    async set<SetInto extends TMessage>(into: SetInto, value: undefined): Promise<SetInto> {
        return this.lens.set(into, this.value);
    }
}

export function value<TSet, TGet = TSet, TMessage extends HttpMessage = HttpMessage>(
    value: TSet,
    lens: MessageLens<TMessage, TGet, TSet>,
    opts: Partial<StaticValueOpts<TGet, TSet>> = {}): MessageLens<TMessage, undefined> {
    return new StaticValueLens(value, lens, opts)
}