import {bufferText} from "./bodies";
import {Body, Data, HttpMessage, HttpRequest, HttpResponse, isMessage} from "./contract";
import {modify} from "./objects";

async function* yieldStringify(data: object): AsyncIterable<Data> {
  yield JSON.stringify(data)
}

export class JsonBody<T = any> implements AsyncIterable<Data> {
  constructor(public readonly data: Readonly<T>) {
  }

  [Symbol.asyncIterator](): AsyncIterator<Data> {
    return yieldStringify(this.data)[Symbol.asyncIterator]();
  }
}

/**
 * A JsonBody is an AsyncIterator<Data> (and is therefore a Body), which will lazily yield
 * JSON.stringify(data) when asked to stream, but also contains the original data without
 * needing to be deserialised.
 *
 * This is useful when composing middlewares that would otherwise need to repeatedly
 * parse body, make changes, then stringify the result between each step.
 */
export function jsonBody<T>(data: T): JsonBody<T> {
  return new JsonBody(data);
}

export async function bodyJson<T>(body: Body): Promise<T>;
export async function bodyJson<T>(message: HttpMessage): Promise<T>;
/**
 * Parse json from body or message.body.
 *
 * If body is already a JsonBody, it will not be parsed again, and
 * this function will simply return body.json.
 *
 * Use the parseJson function
 */
export async function bodyJson<T>(value: Body | HttpMessage): Promise<T> {
  const body = isMessage(value) ? value.body : value;
  if (body instanceof JsonBody)
    return body.data;
  return JSON.parse(await bufferText(body));
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

  return modify(message, {body: jsonBody(bodyJson(message.body))} as any);
}