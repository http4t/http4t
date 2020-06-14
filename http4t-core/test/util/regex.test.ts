import {expect} from "chai";
import {Regex} from "../../src/util/regex";

describe('Regex', () => {
    it('match one', () => {
        const match = new Regex('a/(.+)/b').match('a/capture/b');

        expect(match).eql([
            'a/capture/b',
            'capture'
        ]);
    });

    it('match many in one go', () => {
        const match = new Regex('a/(.+)/b/(.+)').match('a/capture1/b/capture2');

        expect(match).eql([
            'a/capture1/b/capture2',
            'capture1',
            'capture2'
        ]);
    });

    it('match many iterator', () => {
        const match = Array.from(new Regex('\/([^\/]+)').matches('/ab/cd'));

        expect(match).eql([
            ['/ab', 'ab'],
            ['/cd', 'cd'],
        ]);
    });

    it('gives you non-matched', () => {
        const regex = new Regex('\/(\\w+)');
        Array.from(regex.matches('!!/ab/@@/cd/££/ef/$$'));

        expect(regex.matched).eql([
            ['/ab', 'ab'],
            ['/cd', 'cd'],
            ['/ef', 'ef']
        ]);
        expect(regex.nonMatched).eql([
            '!!',
            '/@@',
            '/££'
        ]);
    });
});

