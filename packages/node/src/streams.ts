import {streamBinary} from "@http4t/core/bodies";
import {HttpBody} from "@http4t/core/contract";
import {AsyncIteratorHandler} from "@http4t/core/util/AsyncIteratorHandler";
import {ENCODER} from "@http4t/core/util/textencoding";
import {Readable, Writable} from 'stream';


export async function bodyToWriteStream(body: HttpBody, stream: Writable): Promise<void> {
    try {
        for await (const chunk of streamBinary(body)) {
            const buffer = Buffer.alloc(chunk.buffer.byteLength);
            buffer.set(chunk)
            stream.write(buffer);
        }
        stream.end();
    } catch (e: any) {
        // TODO: check this is sensible behaviour
        stream.emit('error', e);
        stream.end();
        throw e;
    }
}

export function readableStreamToBody(stream: Readable): HttpBody {
    return {
        [Symbol.asyncIterator]: function (): AsyncIterator<Uint8Array> {
            const iterator = new AsyncIteratorHandler<Uint8Array>();
            stream.on("data", chunk => {
                iterator.push(typeof chunk === 'string' ? ENCODER.encode(chunk) : chunk);
            });
            stream.on("end", () => {
                iterator.end();
            });
            stream.on("error", error => {
                iterator.error(error);
            });
            return iterator;
        }
    };
}
