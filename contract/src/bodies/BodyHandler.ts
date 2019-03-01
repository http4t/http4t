import {AsyncBody, Body, Data} from "../contract";
import {isAsyncIterable, isIterable, isPromiseLike, isUint8Array, typeDescription} from "../util";

// TODO: Remove?
export interface BodyHandler<T> {
  data(body: Data): Promise<T>;

  promise(body: Promise<Data>): Promise<T>;

  iterable(body: Iterable<Data>): Promise<T>;

  asynciterable(body: AsyncIterable<Data>): Promise<T>;
}
// TODO: Remove?
export function handleBody<T>(handler: BodyHandler<T>, body: Body): Promise<T> {
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


