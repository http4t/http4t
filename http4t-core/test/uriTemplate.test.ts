import {expect} from "chai";
import {UriTemplate} from "../src/UriTemplate";

describe('UriTemplate', () => {
    it('matches uris or not', () => {
        const uriTemplate = UriTemplate.of('/part/{name}/part');

        expect(uriTemplate.matches('/doesnt/match')).eq(false);
        expect(uriTemplate.matches('/part/capture/part')).eq(true);
        expect(uriTemplate.matches('/part/capture/part/more')).eq(false);
    });

    it('ignores trailing slashes', () => {
        const uriTemplate = UriTemplate.of('/part/{capture}/part/');

        expect(uriTemplate.matches('/doesnt/match')).eq(false);
        expect(uriTemplate.matches('/part/capture/part')).eq(true);
        expect(uriTemplate.matches('/part/capture/part/')).eq(true);
    });

    it('extracts captures', () => {
        const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part/');

        expect(uriTemplate.extract('/part/one/two/part')).eql({
            path: {
                capture1: 'one',
                capture2: 'two'
            },
            query: {}
        });
    });

    it('extracts all queries', () => {
        const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part/');

        expect(uriTemplate.extract('/part/one/two/part/?a=1&a=2&b=3')).eql({
            path: {
                capture1: 'one',
                capture2: 'two'
            },
            query: {
                a: ['1', '2'],
                b: '3'
            }
        });
    });

    it('overlapping variables are ok', () => {
        const uriTemplate = UriTemplate.of('/part/{a}/{b}/part/');

        expect(uriTemplate.extract('/part/one/two/part/?a=1&a=2&b=3&c=4')).eql({
            path: {
                a: 'one',
                b: 'two'
            },
            query: {
                a: ['1', '2'],
                b: '3',
                c: '4'
            }
        });
    });

    it('extracts uri ending', () => {
        const uriTemplate1 = UriTemplate.of('/part/{capture1}/{capture2:.*}/');
        const uriTemplate2 = UriTemplate.of('/part/{capture1}/{capture2:.*}/five');

        expect(uriTemplate1.extract('/part/one/two/three/four')).eql({
            path: {
                capture1: 'one',
                capture2: 'two/three/four'
            },
            query: {}
        });

        expect(uriTemplate2.extract('/part/one/two/three/four/five')).eql({
            path: {
                capture1: 'one',
                capture2: 'two/three/four'
            },
            query: {}
        });
    });

    it('is reversible', () => {
        const uriTemplate = UriTemplate.of('/part/{capture1}/{capture2}/part');
        const uri = '/part/one/two/part';

        expect(uriTemplate.expand(uriTemplate.extract(uri))).eq(uri);
    });

    it('encodes / decodes uri segments', () => {
        const uriTemplate = UriTemplate.of('/part/{capture1}/part/');
        const uri = '/part/one%2Ftwo/part/';

        expect(uriTemplate.extract(uri)).eql({
            path: {
                capture1: 'one/two'
            },
            query: {}
        });

        expect(uriTemplate.expand(uriTemplate.extract(uri))).eq(uri);
    });

    it('supports custom regex', () => {
        const uriTemplate = UriTemplate.of('/part/{capture1:\\d+}/part/{capture2:\\w?}');
        const uriDoesntMatch = '/part/abc/part/123';
        const uriDoesMatch = '/part/123/part/a';

        expect(uriTemplate.matches(uriDoesntMatch)).eq(false);
        expect(uriTemplate.extract(uriDoesMatch)).eql({
            path: {
                capture1: '123',
                capture2: 'a'
            },
            query: {}
        });
    });

});

