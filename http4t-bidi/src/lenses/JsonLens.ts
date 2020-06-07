import {HttpMessage} from "@http4t/core/contract";
import {header} from "@http4t/core/headers";
import {bodyJson, jsonBody, JsonBody} from "@http4t/core/json";
import {response} from "@http4t/core/responses";
import {success} from "@http4t/result";
import {MessageLens, routeFailed, RoutingResult} from "../routes";

/**
 * NB: does not _check_ `Content-Type` header when extracting, but does
 * _set_ it when injecting
 *
 * Uses {@link JsonBody} to avoid deserialising twice.
 */
export class JsonLens<T, TMessage extends HttpMessage> implements MessageLens<TMessage, T> {
  async get(message: TMessage): Promise<RoutingResult<T>> {
    try {
      const value = await bodyJson<T>(message.body);
      return success(value);
    } catch (e) {
      return routeFailed(`Expected valid json${e.message ? `- "${e.message}"` : ""}`, response(400))
    }
  }

  async set(into: TMessage, value: T): Promise<TMessage> {
    return {
      ...into,
      headers: [...into.headers, header('Content-Type', 'application/json')],
      body: jsonBody(value)
    };
  }
}

export function json<T = any, TMessage extends HttpMessage = HttpMessage>(): JsonLens<T, TMessage> {
  return new JsonLens<T, TMessage>();
}