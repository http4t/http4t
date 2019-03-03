import {Readable, Writable} from 'stream';
import {AsyncIteratorHandler} from "../../AsyncIteratorHandler";

import {streamBinary, textEncoder} from "../../bodies";
import {Body} from "../../contract";

export async function bodyToStream(body: Body | undefined, stream: Writable): Promise<void> {
  if (!body) return stream.end();

  try {
    for  await (const chunk of  streamBinary(body)) {
      stream.write(new Buffer(chunk));
    }
    stream.end();
  } catch (e) {
    // TODO: check this is sensible behaviour
    stream.emit('error', e);
    stream.end();
  }
}

export function streamToBody(stream: Readable): Body {
  return {
    [Symbol.asyncIterator]: function (): AsyncIterator<Uint8Array> {
      const iterator = new AsyncIteratorHandler<Uint8Array>();
      stream.on("data", chunk => {
        iterator.push(typeof chunk === 'string' ? textEncoder().encode(chunk) : chunk);
      });
      stream.on("end", () => {
        iterator.end()
      });
      stream.on("error", error => {
        iterator.error(error)
      });
      return iterator;
    }
  };
}