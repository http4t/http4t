import chai from "chai";
const { expect } = chai;
import {get, uri, uriString} from "@http4t/core/requests";
import {Uri} from "@http4t/core/uri";

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
