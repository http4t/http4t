import {Readable, Writable} from 'stream';
import {AsyncIteratorHandler} from "@http4t/core/AsyncIteratorHandler";
import {textEncoder} from "@http4t/core/textencoding";
import {Body} from "@http4t/core/contract";
import {streamBinary} from "@http4t/core/bodies";


export async function bodyToStream(body: Body, stream: Writable): Promise<void> {
  try {
    for  await (const chunk of streamBinary(body)) {
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