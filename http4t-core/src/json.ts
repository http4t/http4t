import {bufferText} from "./bodies";
import {HttpBody, Data, HttpMessage, HttpRequest, HttpResponse, isMessage} from "./contract";
import {modify} from "./util/objects";

async function* yieldStringify(data: object): AsyncIterable<Data> {
  yield typeof data ==='undefined' ? "" : JSON.stringify(data)
}

export class JsonBody<T = any> implements AsyncIterable<Data> {
  constructor(public readonly data: Readonly<T>) {
  }

  [Symbol.asyncIterator](): AsyncIterator<Data> {
    return yieldStringify(this.data)[Symbol.asyncIterator]();
  }
}

/**
 * A JsonBody is an AsyncIterable<Data> (and is therefore a Body), which will lazily yield
 * JSON.stringify(data) when asked to stream, but also contains the original data without
 * needing to be deserialised.
 *
 * This is useful when composing middlewares that would otherwise need to repeatedly
 * parse body, make changes, then stringify the result between each step.
 */
export function jsonBody<T>(data: T): JsonBody<T> {
  return new JsonBody(data);
}

export async function bodyJson<T>(body: HttpBody): Promise<T>;
export async function bodyJson<T>(message: HttpMessage): Promise<T>;
/**
 * Parse json from body or message.body.
 *
 * If body is already a JsonBody, it will not be parsed again, and
 * this function will simply return body.data.
 *
 * Use the parseJson function
 */
export async function bodyJson<T>(value: HttpBody | HttpMessage): Promise<T | undefined> {
  const body = isMessage(value) ? value.body : value;
  if (body instanceof JsonBody)
    return body.data;
  const text = await bufferText(body);
  if(text === "") return undefined;
  return JSON.parse(text);
}

/**
 * Construct a new message, replacing message.body with a JsonBody so that json only
 * needs to be parsed once
 *
 * No-op if message.body is already JsonBody.
 */
export async function parseJson<T extends HttpRequest | HttpResponse>(message: T): Promise<T> {
  if (message.body instanceof JsonBody)
    return message;

  const parsed = bodyJson(message.body);
  return modify(message, {body: jsonBody(parsed)} as any);
}