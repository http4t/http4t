import {HttpBody} from "@http4t/core/contract";
import {streamBinary} from "@http4t/core/bodies";

export function bodyToReadableStream(body: HttpBody): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
        start: async controller => {
            try {
                for await(const chunk of streamBinary(body)) {
                    controller.enqueue(chunk);
                }
            } catch (e: any) {
                controller.error(e);
            } finally {
                controller.close();
            }
        }
    });
}

export async function* readableStreamToBody(stream: ReadableStream<Uint8Array>): AsyncIterable<Uint8Array> {
    const reader = stream.getReader();
    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                return;
            }
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}
