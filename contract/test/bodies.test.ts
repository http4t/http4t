import {expect} from "chai";
import {TextEncoder} from "util";
import {Bodies, BodyHandler, handle} from "../src/bodies";

describe('handle()', () => {
  const handler: BodyHandler<string> = {
    data: async (b) => 'data',
    promise: async (b) => 'promise',
    iterable: async (b) => 'iterable',
    asynciterable: async (b) => 'async iterable',
  };

  it('handles strings', async () => {
    const body = "a string";
    expect(await handle(handler, body)).eq("data");
  });

  it('handles Uint8Array', async () => {
    expect(await handle(handler, new Uint8Array(2))).eq('data');
  });

  it('handles iterables', async () => {
    expect(await handle(handler, [])).eq('iterable');
  });

  it('handles async iterables', async () => {
    const body: AsyncIterable<string> = {

      [Symbol.asyncIterator]: async function* () {
        yield "chunk"
      }
    };
    expect(await handle(handler, body)).eq('async iterable');
  });
});

describe('text()', () => {
  it('handles strings', async () => {
    const body = "a string";
    expect(await Bodies.text(body)).eq("a string");
  });

  it('handles Uint8Array', async () => {
    const data = new TextEncoder().encode('data');
    expect(await Bodies.text(data)).eq('data');
  });

  it('handles iterables', async () => {
    expect(await Bodies.text( ["chunk1","chunk2"])).eq('chunk1chunk2');
  });

  it('handles async iterables', async () => {
    const body: AsyncIterable<string> = {

      [Symbol.asyncIterator]: async function* () {
        yield "chunk1";
        yield "chunk2";
      }
    };
    expect(await Bodies.text( body)).eq('chunk1chunk2');
  });
});