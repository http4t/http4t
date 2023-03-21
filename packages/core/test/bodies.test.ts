import chai from "chai";
const { expect } = chai;
import {bufferBinary, bufferText, streamBinary, streamText} from "@http4t/core/bodies";
import {ENCODER} from "@http4t/core/util/textencoding";

describe('bufferText()', () => {
    it('handles strings', async () => {
        const body = "a string";
        expect(await bufferText(body)).eq("a string");
    });

    it('handles Uint8Array', async () => {
        const body: Uint8Array = ENCODER.encode('data');
        expect(await bufferText(body)).eq('data');
    });

    it('handles iterables of strings', async () => {
        const body = ["chunk1", "chunk2"];
        expect(await bufferText(body)).eq('chunk1chunk2');
    });

    it('handles iterables of data', async () => {
        const body = [ENCODER.encode('chunk1'), ENCODER.encode('chunk2')];
        expect(await bufferText(body)).eq('chunk1chunk2');
    });

    it('handles async iterables of strings', async () => {
        const body: AsyncIterable<string> = {

            [Symbol.asyncIterator]: async function* () {
                yield "chunk1";
                yield "chunk2";
            }
        };
        expect(await bufferText(body)).eq('chunk1chunk2');
    });

    it('handles async iterables of data', async () => {
        const body: AsyncIterable<Uint8Array> = {

            [Symbol.asyncIterator]: async function* () {
                yield ENCODER.encode("chunk1");
                yield ENCODER.encode("chunk2");
            }
        };
        expect(await bufferText(body)).eq('chunk1chunk2');
    });
});

describe('bufferBinary()', () => {
    it('handles strings', async () => {
        const body = "a string";
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('a string'));
    });

    it('handles Uint8Array', async () => {
        const body: Uint8Array = ENCODER.encode('some data');
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('some data'));
    });

    it('handles iterables of strings', async () => {
        const body = ["chunk1", "chunk2"];
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles iterables of data', async () => {
        const body = [ENCODER.encode('chunk1'), ENCODER.encode('chunk2')];
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles async iterables of strings', async () => {
        const body: AsyncIterable<string> = {

            [Symbol.asyncIterator]: async function* () {
                yield "chunk1";
                yield "chunk2";
            }
        };
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles async iterables of data', async () => {
        const body: AsyncIterable<Uint8Array> = {

            [Symbol.asyncIterator]: async function* () {
                yield ENCODER.encode('chunk1');
                yield ENCODER.encode('chunk2');
            }
        };
        expect(await bufferBinary(body)).deep.eq(ENCODER.encode('chunk1chunk2'));
    });
});

describe('streamText()', () => {
    it('handles strings', async () => {
        const body = "a string";
        expect(await bufferText(await streamText(body))).eq("a string");
    });

    it('handles Uint8Array', async () => {
        const body: Uint8Array = ENCODER.encode('data');
        expect(await bufferText(await streamText(body))).eq('data');
    });

    it('handles iterables of strings', async () => {
        const body = ["chunk1", "chunk2"];
        expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
    });

    it('handles iterables of data', async () => {
        const body = [ENCODER.encode('chunk1'), ENCODER.encode('chunk2')];
        expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
    });

    it('handles async iterables of strings', async () => {
        const body: AsyncIterable<string> = {

            [Symbol.asyncIterator]: async function* () {
                yield "chunk1";
                yield "chunk2";
            }
        };
        expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
    });

    it('handles async iterables of data', async () => {
        const body: AsyncIterable<Uint8Array> = {

            [Symbol.asyncIterator]: async function* () {
                yield ENCODER.encode("chunk1");
                yield ENCODER.encode("chunk2");
            }
        };
        expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
    });
});

describe('streamBinary()', () => {
    it('handles strings', async () => {
        const body = "a string";
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('a string'));
    });

    it('handles Uint8Array', async () => {
        const body: Uint8Array = ENCODER.encode('some data');
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('some data'));
    });

    it('handles iterables of strings', async () => {
        const body = ["chunk1", "chunk2"];
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles iterables of data', async () => {
        const body = [ENCODER.encode('chunk1'), ENCODER.encode('chunk2')];
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles async iterables of strings', async () => {
        const body: AsyncIterable<string> = {

            [Symbol.asyncIterator]: async function* () {
                yield "chunk1";
                yield "chunk2";
            }
        };
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('chunk1chunk2'));
    });

    it('handles async iterables of data', async () => {
        const body: AsyncIterable<Uint8Array> = {

            [Symbol.asyncIterator]: async function* () {
                yield ENCODER.encode('chunk1');
                yield ENCODER.encode('chunk2');
            }
        };
        expect(await bufferBinary(await streamBinary(body))).deep.eq(ENCODER.encode('chunk1chunk2'));
    });
});
