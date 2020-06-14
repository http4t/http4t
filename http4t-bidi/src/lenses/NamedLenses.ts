import {HttpMessage} from "@http4t/core/contract";
import {isFailure, success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";

export type Lenses<TMessage extends HttpMessage, T extends object> = { [K in keyof T]: MessageLens<TMessage, T[K]> };

export class NamedLenses<TMessage extends HttpMessage, T extends object> implements MessageLens<TMessage, T> {
    constructor(private readonly lenses: Lenses<TMessage, T>) {
    }

    async get(output: TMessage): Promise<RoutingResult<T>> {
        const value: T = {} as T;

        for (const [k, lens] of Object.entries(this.lenses)) {

            const result: RoutingResult<any> = await (lens as MessageLens<any, TMessage>).get(output);

            // you only get one lens failure (the first lens failure)
            // and it's hard to debug which lens failed
            if (isFailure(result)) {
                return result;
            }
            value[k as keyof T] = result.value;
        }
        return success(value);
    }

    set(into: TMessage, value: T): Promise<TMessage> {
        const injectField = async (message: Promise<TMessage>, [k, lens]: [string, unknown]): Promise<TMessage> => {
            return await (lens as MessageLens<TMessage, any>).set(await message, value[k as keyof T]);
        };
        return Object.entries(this.lenses).reduce(injectField, Promise.resolve(into));
    }
}

export function named<TMessage extends HttpMessage, T extends object>(lenses: Lenses<TMessage, T>): MessageLens<TMessage, T> {
    return new NamedLenses(lenses);
}