import {Body, Data} from "./";
import {asString, BodyData, handleData} from "./data";
import {isAsyncIterable, isIterable, isPromiseLike, isUint8Array, toPromiseArray, typeDescription} from "./util";

export interface BodyHandler<T> {
  data(body: Data): Promise<T>;

  promise(body: Promise<Data>): Promise<T>;

  iterable(body: Iterable<Data>): Promise<T>;

  asynciterable(body: AsyncIterable<Data>): Promise<T>;
}

export function handle<T>(handler: BodyHandler<T>, body: Body): Promise<T> {
  if (isPromiseLike(body))
    return handler.promise(body);
  if (typeof body === 'string' || isUint8Array(body))
    return handler.data(body);
  if (isAsyncIterable(body))
    return handler.asynciterable(body);
  if (isIterable(body))
    return handler.iterable(body as Iterable<Data>); // Can't figure out why we need to cast here

  throw new Error(`Not a valid body: '${body}' (${typeDescription(body)})`)
}

export class TextHandler implements BodyHandler<string | undefined> {
  async asynciterable(body: AsyncIterable<Data>): Promise<string> {
    return (await toPromiseArray(body)).map(BodyData.asString).join("");
  }

  async data(body: Data): Promise<string> {
    return handleData(asString, body);
  }

  async iterable(body: Iterable<Data>): Promise<string> {
    return [...body].map(BodyData.asString).join("");
  }

  async promise(body: Promise<Data>): Promise<string> {
    return this.data(await body);
  }

}

export const toStringHandler = new TextHandler();

export class Bodies {
  static async text(body: Body): Promise<string> {
    if (typeof body !== 'undefined')
      return this.maybeText(body) as Promise<string>;
    throw new Error("Body was undefined")
  }

  static maybeText(body: Body): Promise<string | undefined> {
    return handle(toStringHandler, body);
  }
}
