import {HttpMessage} from "@http4t/core/contract";
import {header} from "@http4t/core/headers";
import {success} from "@http4t/result";
import {MessageLens, RoutingResult} from "../lenses";
import {bufferText, typeDescription} from "@http4t/core/bodies";

/**
 * NB: does not _check_ `Content-Type` header when extracting, but does
 * _set_ it when injecting
 *
 */
export class TextLens<TMessage extends HttpMessage> implements MessageLens<TMessage, string> {
    async get(message: TMessage): Promise<RoutingResult<string>> {
        return success(await bufferText(message.body));
    }

    async set<SetInto extends TMessage>(into: SetInto, value: string): Promise<SetInto> {
        if (typeof value !== "string")
            throw new Error(`Expected a string but got ${value} (${typeDescription(value)})`)

        return {
            ...into,
            headers: [...into.headers, header('Content-Type', 'text/plain')],
            body: value
        };
    }
}

export function text<TMessage extends HttpMessage = HttpMessage>(): TextLens<TMessage> {
    return new TextLens<TMessage>();
}
