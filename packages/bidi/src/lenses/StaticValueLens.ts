import {HttpMessage} from "@http4t/core/contract";
import {failure, isFailure, success} from "@http4t/result";
import {MessageLens, routeFailedError, RoutingError, RoutingResult} from "../lenses";
import {responseOf} from "@http4t/core/responses";

export type StaticValueOpts<T = unknown> = {
    equality: (a: T, b: T) => boolean,
    failure: (value: T) => RoutingError
};

function defaults<T>(value: T): StaticValueOpts<T> {
    return {
        equality: (a: T, b: T) => a === b,
        failure: v => routeFailedError(`Expected: ${value}, but got: ${v}`, [], responseOf(400))
    };
}

export class StaticValueLens<TMessage extends HttpMessage = HttpMessage, T = unknown> implements MessageLens<TMessage, undefined> {
    private readonly opts: StaticValueOpts<T>;

    constructor(private readonly value: T,
                private readonly lens: MessageLens<TMessage, T>,
                opts: Partial<StaticValueOpts<T>>) {
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

export function value<T, TMessage extends HttpMessage = HttpMessage>(
    value: T,
    lens: MessageLens<TMessage, T>,
    opts: Partial<StaticValueOpts<T>> = {}): MessageLens<TMessage, undefined> {
    return new StaticValueLens(value, lens, opts)
}