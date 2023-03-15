import {HttpMessage} from "@http4t/core/contract";
import {header} from "@http4t/core/headers";
import {bodyJson, jsonBody} from "@http4t/core/json";
import {success} from "@http4t/result";
import {MessageLens, routeFailed, RoutingResult} from "../lenses";

/**
 * NB: does not _check_ `Content-Type` header when extracting, but does
 * _set_ it when injecting
 *
 * Uses {@link JsonBody} to avoid deserialising twice.
 */
export class JsonLens<T> implements MessageLens<HttpMessage, T> {
    async get(message: HttpMessage): Promise<RoutingResult<T>> {
        try {
            const value = await bodyJson<T>(message.body);
            return success(value);
        } catch (e: any) {
            return routeFailed(`Expected valid json${e.message ? `- ${e.message}` : ""}`, ["body"])
        }
    }

    async set<SetInto extends HttpMessage>(into: SetInto, value: T): Promise<SetInto> {
        return {
            ...into,
            headers: [...into.headers, header('Content-Type', 'application/json')],
            body: jsonBody(value)
        };
    }
}

export function json<T extends object>(): MessageLens<HttpMessage, T> {
    return new JsonLens<T>();
}
