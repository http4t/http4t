import {Body, Data} from "./contract";

/*
-----------------------------------
Core functions
-----------------------------------
 */

export class Buffered {
  static text = bufferText;
  static binary = bufferBinary;
}

export class Streamed {
  static text = streamText;
  static binary = streamBinary;
}

export async function bufferText(body: Body): Promise<string> {
  if (isPromiseLike(body)) {
    return dataString(await body);
  }
  if (isAsyncIterable(body)) {
    return (await toPromiseArray(body)).map(dataString).join("");
  }
  if (isData(body)) {
    return dataString(body);
  }
  if (isIterable(body)) {
    return Array.from(body).map(dataString).join("")
  }
  throw new Error(`Not a valid body: '${body}' (${typeDescription(body)})`)
}

export async function bufferBinary(body: Body): Promise<Uint8Array> {
  throw new Error("Not implemented");
}

export function streamText(body: Body): AsyncIterable<string> {
  throw new Error("Not implemented");
}

export async function* streamBinary(body: Body): AsyncIterable<Uint8Array> {
  if (isPromiseLike(body)) {
    yield dataBinary(await body);
    return;
  }
  if (isAsyncIterable(body)) {
    for await(const chunk of body) {
      yield dataBinary(chunk);
    }
    return;
  }
  if (isData(body)) {
    yield dataBinary(body);
    return;
  }
  if (isIterable(body)) {
    for (const chunk of body) {
      yield dataBinary(chunk);
    }
    return;
  }
  throw new Error(`Not a valid body: '${body}' (${typeDescription(body)})`)
}

export function dataString(data: Data) {
  if (typeof data === 'string') return data;
  if (data instanceof Uint8Array) return textDecoder().decode(data);
  throw new Error(`Not supported ${typeDescription(data)}`)
}

export function dataBinary(data: Data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return textEncoder().encode(data);
  throw new Error(`Not supported ${typeDescription(data)}`)
}

/*
-----------------------------------
Helpers
-----------------------------------
 */

function textDecoder():TextDecoder {
  if(typeof TextDecoder === 'function')
    return new TextDecoder('utf-8');
  const util = require('util');
  return new util.TextDecoder('utf-8')
}

function textEncoder():TextEncoder{
  if(typeof TextEncoder === 'function')
    return new TextEncoder();
  const util = require('util');
  return new util.TextEncoder()
}

// TODO: this is janky, but nice error messages are nice. Have a think about it
export function typeDescription(x: any): string {
  if (x === null)
    return 'null';

  let t = typeof x;
  if (t !== 'object') return t;

  const p = Object.getPrototypeOf(x);
  if (p !== Object.prototype)
    return p.constructor.name;

  return t
}

function isAsyncIterable(instance: any): instance is AsyncIterable<any> {
  return typeof instance == 'object' && Symbol.asyncIterator in instance;
}


function isIterable(instance: any): instance is Iterable<any> {
  return typeof instance == 'object' && Symbol.iterator in instance;
}


function isUint8Array(instance: any): instance is Uint8Array {
  return typeof instance == 'object' && instance instanceof Uint8Array;
}

function isData(instance: any): instance is Data {
  return typeof instance == 'string' || isUint8Array(instance);
}

function isPromiseLike(instance: any): instance is PromiseLike<any> {
  return typeof instance == 'object' && 'then' in instance;
}

async function toPromiseArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const value of iterable) result.push(value);
  return result;
}
