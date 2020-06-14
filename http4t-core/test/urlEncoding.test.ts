import {expect} from 'chai';
import {DecodedPair, parse, unparse} from "../src/urlEncoding";

function checkParsing(value: string, expected: DecodedPair[]) {
    expect(parse(value)).deep.eq(expected);
    expect(unparse(expected)).eq(value);
}

describe('parse() and unparse()', () => {
    it('Supports simple names and values', async () => {
        checkParsing(
            'name=value',
            [['name', 'value']]);
    });
    it('Supports multiple pairs', async () => {
        checkParsing(
            'name=value&name=value&other-name=other-value&empty=&null',
            [['name', 'value'], ['name', 'value'], ['other-name', 'other-value'], ['empty', ''], ['null', null]]);
    });
    it('Supports percent encoding', async () => {
        checkParsing(
            'name%C3%BC%40=value%C3%BC%40',
            [['nameü@', 'valueü@']]);
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
            [['name', null]])
    });
});