import {expect} from "chai";
import {TextEncoder} from "util";
import {Bodies, BodyHandler, handleBody} from "../src";

describe('handleBody()', () => {
  const handler: BodyHandler<string> = {
    data: async (b) => 'data',
    promise: async (b) => 'promise',
    iterable: async (b) => 'iterable',
    asynciterable: async (b) => 'async iterable',
  };

  it('handles strings', async () => {
    const body = "a string";
    expect(await handleBody(handler, body)).eq("data");
  });

  it('handles Uint8Array', async () => {
    expect(await handleBody(handler, new Uint8Array(2))).eq('data');
  });

  it('handles iterables', async () => {
    expect(await handleBody(handler, [])).eq('iterable');
  });

  it('handles async iterables', async () => {
    const body: AsyncIterable<string> = {

      [Symbol.asyncIterator]: async function* () {
        yield "chunk"
      }
    };
    expect(await handleBody(handler, body)).eq('async iterable');
  });
});

describe('Bodies.text()', () => {
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