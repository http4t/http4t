import {expect} from "chai";
import {get, uri, uriString} from "../src/requests";
import {Uri} from "../src/uri";

describe('requests', () => {
    describe('uri', () => {
        it('works for strings', () => {
            expect(uri(get('/hello'))).deep.eq(Uri.of('/hello'))
        })
    });
    describe('uriString', () => {
        it('works for uris', () => {
            expect(uriString(get(Uri.of('/hello')))).deep.eq('/hello')
        })
    });
});