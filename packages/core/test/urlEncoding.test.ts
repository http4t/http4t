import chai from "chai";
const { expect } = chai;
import {DecodedPair, decodePairs, encodePairs} from "@http4t/core/urlEncoding";

function checkParsing(value: string, expected: DecodedPair[]) {
    expect(decodePairs(value)).deep.eq(expected);
    expect(encodePairs(expected)).eq(value);
}

describe('parse() and unparse()', () => {
    it('Supports simple names and values', async () => {
        checkParsing(
            'name=value',
            [['name', 'value']]);
    });
    it('Supports multiple pairs', async () => {
        checkParsing(
            'name=value&name=value&other-name=other-value&empty=&undefined',
            [['name', 'value'], ['name', 'value'], ['other-name', 'other-value'], ['empty', ''], ['undefined', undefined]]);
    });
    it('Supports percent encoding', async () => {
        checkParsing(
            'name%C3%BC%40=value%C3%BC%40',
            [['nameü@', 'valueü@']]);
    });
    it('Supports percent encoding "+"', async () => {
        checkParsing(
            'name%2B=value%2B',
            [['name+', 'value+']]);
    });
    it('Supports spaces', async () => {
        checkParsing(
            'the+name=the+value',
            [['the name', 'the value']]);
    });
    it('Supports empty value', async () => {
        checkParsing(
            'name=',
            [['name', '']])
    });
    it('Supports no value', async () => {
        checkParsing('name',
            [['name', undefined]])
    });
});
