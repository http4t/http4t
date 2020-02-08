import {expect} from "chai";
import {describe, it} from "mocha";
import {bufferBinary, bufferText, streamBinary, streamText} from "../src/bodies";
import {textEncoder} from "../src/util/textencoding";

describe('bufferText()', () => {
  it('handles strings', async () => {
    const body = "a string";
    expect(await bufferText(body)).eq("a string");
  });

  it('handles Uint8Array', async () => {
    const body: Uint8Array = textEncoder().encode('data');
    expect(await bufferText(body)).eq('data');
  });

  it('handles iterables of strings', async () => {
    const body = ["chunk1", "chunk2"];
    expect(await bufferText(body)).eq('chunk1chunk2');
  });

  it('handles iterables of data', async () => {
    const body = [textEncoder().encode('chunk1'), textEncoder().encode('chunk2')];
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
        yield textEncoder().encode("chunk1");
        yield textEncoder().encode("chunk2");
      }
    };
    expect(await bufferText(body)).eq('chunk1chunk2');
  });
});

describe('bufferBinary()', () => {
  it('handles strings', async () => {
    const body = "a string";
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('a string'));
  });

  it('handles Uint8Array', async () => {
    const body: Uint8Array = textEncoder().encode('some data');
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('some data'));
  });

  it('handles iterables of strings', async () => {
    const body = ["chunk1", "chunk2"];
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles iterables of data', async () => {
    const body = [textEncoder().encode('chunk1'), textEncoder().encode('chunk2')];
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles async iterables of strings', async () => {
    const body: AsyncIterable<string> = {

      [Symbol.asyncIterator]: async function* () {
        yield "chunk1";
        yield "chunk2";
      }
    };
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles async iterables of data', async () => {
    const body: AsyncIterable<Uint8Array> = {

      [Symbol.asyncIterator]: async function* () {
        yield textEncoder().encode('chunk1');
        yield textEncoder().encode('chunk2');
      }
    };
    expect(await bufferBinary(body)).deep.eq(textEncoder().encode('chunk1chunk2'));
  });
});

describe('streamText()', () => {
  it('handles strings', async () => {
    const body = "a string";
    expect(await bufferText(await streamText(body))).eq("a string");
  });

  it('handles Uint8Array', async () => {
    const body: Uint8Array = textEncoder().encode('data');
    expect(await bufferText(await streamText(body))).eq('data');
  });

  it('handles iterables of strings', async () => {
    const body = ["chunk1", "chunk2"];
    expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
  });

  it('handles iterables of data', async () => {
    const body = [textEncoder().encode('chunk1'), textEncoder().encode('chunk2')];
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
        yield textEncoder().encode("chunk1");
        yield textEncoder().encode("chunk2");
      }
    };
    expect(await bufferText(await streamText(body))).eq('chunk1chunk2');
  });
});

describe('streamBinary()', () => {
  it('handles strings', async () => {
    const body = "a string";
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('a string'));
  });

  it('handles Uint8Array', async () => {
    const body: Uint8Array = textEncoder().encode('some data');
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('some data'));
  });

  it('handles iterables of strings', async () => {
    const body = ["chunk1", "chunk2"];
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles iterables of data', async () => {
    const body = [textEncoder().encode('chunk1'), textEncoder().encode('chunk2')];
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles async iterables of strings', async () => {
    const body: AsyncIterable<string> = {

      [Symbol.asyncIterator]: async function* () {
        yield "chunk1";
        yield "chunk2";
      }
    };
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('chunk1chunk2'));
  });

  it('handles async iterables of data', async () => {
    const body: AsyncIterable<Uint8Array> = {

      [Symbol.asyncIterator]: async function* () {
        yield textEncoder().encode('chunk1');
        yield textEncoder().encode('chunk2');
      }
    };
    expect(await bufferBinary(await streamBinary(body))).deep.eq(textEncoder().encode('chunk1chunk2'));
  });
});