import {HttpMessage} from "@http4t/core/contract";
import {header} from "@http4t/core/headers";
import {bodyJson, jsonBody, JsonBody} from "@http4t/core/json";
import {success} from "@http4t/result";
import {JsonPathResult} from "@http4t/result/JsonPathResult";
import {MessageLens} from "../routes";

/**
 * NB: does not _check_ `Content-Type` header when extracting, but does
 * _set_ it when injecting
 *
 * Uses {@link JsonBody} to avoid deserialising twice.
 */
export class JsonLens<T, TMessage extends HttpMessage> implements MessageLens<T, TMessage> {
  async extract(message: TMessage): Promise<JsonPathResult<T>> {
    const value = await bodyJson<T>(message.body);
    return success(value);
  }

  async inject(value: T, message: TMessage): Promise<TMessage> {
    return {
      ...message,
      headers: [...message.headers, header('Content-Type', 'application/json')],
      body: jsonBody(value)
    };
  }
}

export function json<T = any, TMessage extends HttpMessage = HttpMessage>(): JsonLens<T, TMessage> {
  return new JsonLens<T, TMessage>();
}