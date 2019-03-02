import {TextDecoder, TextEncoder} from "util";
import {Body, Data} from "./contract";
import {isAsyncIterable, isData, isIterable, isPromiseLike, toPromiseArray, typeDescription} from "./util";

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
  if (data instanceof Uint8Array) return new TextDecoder("utf-8").decode(data);
  throw new Error(`Not supported ${typeDescription(data)}`)
}

export function dataBinary(data: Data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new Error(`Not supported ${typeDescription(data)}`)
}

