import * as stream from "stream";
import {AsyncIteratorHandler} from "./AsyncIteratorHandler";
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

export function messageBody(message: stream.Readable): Body {
  return {
    [Symbol.asyncIterator]: function (): AsyncIterator<Uint8Array> {
      const iterator = new AsyncIteratorHandler<Uint8Array>();
      message.on("data", chunk => {
        iterator.push(typeof chunk === 'string' ? textEncoder().encode(chunk) : chunk);
      });
      message.on("end", () => {
        iterator.end()
      });
      message.on("error", error => {
        iterator.error(error)
      });
      return iterator;
    }
  };
}

export async function sendBodyToStream(body: Body | undefined, writable: stream.Writable) {
  if (!body)
    return writable.end();

  try {
    for  await (const chunk of  streamBinary(body)) {
      writable.write(new Buffer(chunk));
    }
    writable.end();
  } catch (e) {
    // TODO: check this is sensible behaviour
    writable.emit('error', e);
    writable.end();
  }
}