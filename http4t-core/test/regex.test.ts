import { expect } from "chai";
import { Regex } from "../src/regex";

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

    expect(match[0]).eql([
      ['/ab', 'ab'],
      ''
    ]);

    expect(match[1]).eql([
      ['/cd', 'cd'],
      ''
    ]);

    expect(match[2]).eq(undefined)
  });

  it('gives you non-matched', () => {
    const match = Array.from(new Regex('\/(\\w+)').matches('!!/ab/@@/cd/££/ef/$$'));

    expect(match[0]).eql([
      ['/ab', 'ab'],
      '!!'
    ]);

    expect(match[1]).eql([
      ['/cd', 'cd'],
      '/@@'
    ]);

    expect(match[2]).eql([
      ['/ef', 'ef'],
      '/££'
    ]);

    expect(match[3]).eql([
      null,
      "/$$"
    ]);
  });
});

