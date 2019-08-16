import {it, describe} from "mocha";
import {expect} from "chai";
import {bufferText} from "../src/bodies";
import {textEncoder} from "../src/util/textencoding";

describe('text()', () => {
    it('handles strings', async () => {
        const body = "a string";
        expect(await bufferText(body)).eq("a string");
    });

    it('handles Uint8Array', async () => {
        const body: Uint8Array = textEncoder().encode('data');
        expect(await bufferText(body)).eq('data');
    });

    it('handles iterables', async () => {
        const body = ["chunk1", "chunk2"];
        expect(await bufferText(body)).eq('chunk1chunk2');
    });

    it('handles async iterables', async () => {
        const body: AsyncIterable<string> = {

            [Symbol.asyncIterator]: async function* () {
                yield "chunk1";
                yield "chunk2";
            }
        };
        expect(await bufferText(body)).eq('chunk1chunk2');
    });
});