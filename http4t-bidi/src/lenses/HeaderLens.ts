import {HttpMessage} from "@http4t/core/contract";
import {getHeaderValue} from "@http4t/core/headers";
import {setHeader} from "@http4t/core/messages";
import {success} from "@http4t/result";
import {MessageLens, routeFailed, RoutingResult} from "../lenses";
import {Lenses, named} from "./NamedLenses";

export class HeaderLens<TMessage extends HttpMessage> implements MessageLens<TMessage, string> {
    constructor(private name: string) {
    }

    async get(output: TMessage): Promise<RoutingResult<string>> {
        const headerValue = getHeaderValue(output.headers, this.name);
        return headerValue ? success(headerValue) : routeFailed(`Expected header "${this.name}"`)
    }

    async set(into: TMessage, value: string): Promise<TMessage> {
        return setHeader(into, this.name, value);
    }
}

export function header<TMessage extends HttpMessage>(name: string): MessageLens<TMessage, string> {
    return new HeaderLens(name);
}

export function headers<T extends { [k: string]: string }, TMessage extends HttpMessage>(them: T): MessageLens<TMessage, T> {
    const toHeaderLenses = (lenses: Lenses<TMessage, T>, [name, headerName]: [keyof T, string]): Lenses<TMessage, T> => {
        lenses[name] = header(headerName) as any
        return lenses
    };

    return named(Object.entries(them).reduce(toHeaderLenses, {} as Lenses<TMessage, T>))
}