import * as stream from 'stream';
import {TextEncoder} from 'util';
import {AsyncIteratorHandler} from "../../AsyncIteratorHandler";
import {streamBinary} from "../../bodies";
import {Body, Header, HttpRequest} from "../../contract";

export function fromRawHeaders(rawHeaders: string[]): Header[] {
  if (rawHeaders.length == 0) return [];
  const [name, value, ...remainder] = rawHeaders;
  return [[name, value], ...fromRawHeaders(remainder)];
}

export function messageBody(message: stream.Readable): Body {
  return {
    [Symbol.asyncIterator]: function (): AsyncIterator<Uint8Array> {
      const iterator = new AsyncIteratorHandler<Uint8Array>();
      message.on("data", chunk => {
        iterator.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
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
  if(!body)
    return writable.end();

  try {
    for  await (const chunk of  streamBinary(body)) {
      writable.write(chunk);
    }
    writable.end();
  } catch (e) {
    // TODO: check this is sensible behaviour
    writable.emit('error', e);
    writable.end();
  }
}